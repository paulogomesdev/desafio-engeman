import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPropertyById, createProperty, updateProperty, deleteProperty, PROPERTY_TYPES } from '../services/api';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';

/**
 * PropertyForm.jsx - Formulário de Criação/Edição de Imóveis
 * Design Industrial minimalista com gestão de imagens e status.
 */
const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    area: '',
    bedrooms: '',
    type: 'RESIDENCIAL',
    city: '',
    state: '',
    address: '',
    imageUrls: ''
  });

  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [cep, setCep] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);

  // 💰 Formatador de Moeda Visual (Pro Max)
  const formatCurrency = (val) => {
    if (!val) return '';
    const numericValue = String(val).replace(/\D/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0
    }).format(numericValue);
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, value: rawValue });
  };

  // 📍 Buscar Localização via ViaCEP (Disparado quando digita 8 números do CEP)
  const fetchCep = async (currentCep) => {
    const cleanCep = currentCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsFetchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          state: data.uf || prev.state,
          city: data.localidade || prev.city,
          address: data.logradouro ? `${data.logradouro}, ` : prev.address // Pronta pro usuário adicionar número
        }));
      } else {
        alert("CEP não encontrado.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar CEP.");
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handleCepChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    // Opcional: Colocar máscara 00000-000
    if (val.length > 5) {
      val = val.slice(0, 5) + '-' + val.slice(5);
    }
    setCep(val);

    // Quando atinge os 8 dígitos, fazemos o gatilho automático via CEP
    if (val.replace(/\D/g, '').length === 8) {
      fetchCep(val);
    }
  };

  // 🧭 Tratar Campos Inválidos Nativos + Scroll Suave (Debounced com Ref)
  const invalidPushed = useRef(false);

  const handleInvalid = (e) => {
    e.preventDefault(); // Impede balão feio

    if (invalidPushed.current) return;

    invalidPushed.current = true;
    setTimeout(() => { invalidPushed.current = false; }, 100);

    const fieldName = e.target.getAttribute('data-name') || 'obrigatório';
    setError(`O campo "${fieldName}" precisa ser preenchido corretamente.`);

    // Scroll descontando 150px do Header Flutuante!
    const yOffset = e.target.getBoundingClientRect().top + window.scrollY - 150;
    window.scrollTo({ top: yOffset, behavior: 'smooth' });

    e.target.focus({ preventScroll: true });

    e.target.classList.remove('border-slate-300', 'focus:border-blue-600');
    e.target.classList.add('border-red-500', 'ring-4', 'ring-red-500/20');

    setTimeout(() => {
      e.target.classList.remove('border-red-500', 'ring-4', 'ring-red-500/20');
      e.target.classList.add('border-slate-300', 'focus:border-blue-600');
    }, 4000);
  };

  // 📥 Busca dados se for edição
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (property && isEdit) {
      setFormData(property);
    }
  }, [property, isEdit]);

  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);

  // ☁️ UPLOAD DIRETO PARA O CLOUDINARY (Melhor Prática Frontend)
  // 1. O arquivo não passa pelo backend (Zero processamento e banda no servidor).
  // 2. Vai diretamento da máquina do usuário para a nuvem global da Cloudinary via upload "Unsigned".
  // 3. O Cloudinary retorna uma URL definitiva que é guardada no DTO da Engeman perfeitamente.
  const handleCloudinaryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploadingToCloud(true);
    let uploadedUrls = [];

    // ⚠️ CONFIGURAÇÕES DO CLOUDINARY (Uso Localhost Liberado)
    // 1. Crie uma conta grátis no cloudinary.com
    // 2. Cole seu "Cloud Name" abaixo.
    // 3. Vá em Settings > Upload > Add Upload Preset. Mude "Signing Mode" para "Unsigned". Cole o nome do preset abaixo.
    const CLOUD_NAME = 'dajfrtniy'; // Ex: 'dxq123abc'
    const UPLOAD_PRESET = 'imobimages'; // Ex: 'preset_imoveis_app'

    try {
      for (const file of files) {
        const cloudData = new FormData();
        cloudData.append('file', file);
        cloudData.append('upload_preset', UPLOAD_PRESET);

        // Chamada nativa para o provedor externo
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: cloudData
        });

        const data = await res.json();

        if (data.secure_url) {
          // Aqui a mágica da performance: Podemos injetar w_800,f_auto,q_auto na URL 
          // Mas vamos usar o seguro provido diretamente pelo Cloudinary.
          uploadedUrls.push(data.secure_url);
        } else {
          console.error("Cloudinary Error:", data);
        }
      }

      // Concatena as novas URLs convertidas na string do DTO
      const currentUrls = formData.imageUrls ? formData.imageUrls.split(',').filter(u => u) : [];
      setFormData({
        ...formData,
        imageUrls: [...currentUrls, ...uploadedUrls].join(',')
      });

    } catch (error) {
      console.error('Falha crítica de Upload:', error);
      alert('Houve um erro com o provedor de nuvem. Use a URL manual provisoriamente.');
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  // 🔄 Drag & Drop para Reordenar Galeria
  const handleDragStart = (idx) => setDraggedIdx(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (targetIdx) => {
    if (draggedIdx === null) return;
    const urls = formData.imageUrls.split(',').filter(u => u);
    const itemToMove = urls[draggedIdx];
    const newUrls = [...urls];
    newUrls.splice(draggedIdx, 1);
    newUrls.splice(targetIdx, 0, itemToMove);
    setFormData({ ...formData, imageUrls: newUrls.join(',') });
    setDraggedIdx(null);
  };

  // ⚡ Mutation: Criar/Editar
  const saveMutation = useMutation({
    mutationFn: (data) => isEdit ? updateProperty(id, data) : createProperty(data),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries(['my-properties']);
      setTimeout(() => navigate(-1), 1500);
    },
    onError: (err) => setError(err.message || 'Erro ao salvar imóvel.')
  });

  // ⚡ Mutation: Deletar
  const deleteMutation = useMutation({
    mutationFn: () => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      navigate('/minhas-propriedades');
    }
  });

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel definitivamente?')) {
      deleteMutation.mutate();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validações Manuais
    const numValue = Number(String(formData.value).replace(/\D/g, ''));
    if (numValue <= 0) {
      setError('O valor de venda deve ser maior que zero.');
      const valInput = document.getElementById('input-value');
      if (valInput) {
        const yOffset = valInput.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
      }
      return;
    }

    if (!isEdit && !formData.imageUrls) {
      setError('É obrigatório adicionar pelo menos 1 foto para cadastrar o imóvel.');
      const imgSec = document.getElementById('image-section');
      if (imgSec) {
        const yOffset = imgSec.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
      }
      return;
    }

    // Campos do PropertyCreateDTO (Engeman Spec)
    const createFields = ['name', 'description', 'type', 'value', 'area', 'bedrooms', 'address', 'city', 'state', 'imageUrls'];
    // Campos do PropertyUpdateDTO (Engeman Spec) — todos opcionais, inclui brokerId
    const updateFields = ['name', 'description', 'type', 'value', 'area', 'bedrooms', 'address', 'city', 'state', 'brokerId'];

    const allowedFields = isEdit ? updateFields : createFields;

    const payload = {};
    allowedFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== '') {
        payload[field] = formData[field];
      }
    });

    // Conversão de tipos numéricos
    if (payload.value) payload.value = Number(payload.value);
    if (payload.area) payload.area = Number(payload.area);
    if (payload.bedrooms) payload.bedrooms = Number(payload.bedrooms);
    if (payload.brokerId) payload.brokerId = Number(payload.brokerId);

    saveMutation.mutate(payload);
  };

  if (isLoading && isEdit) return (
    <AuthenticatedLayout title="Carregando...">
      <div className="bg-slate-100 animate-pulse h-96 rounded-2xl" />
    </AuthenticatedLayout>
  );

  return (
    <AuthenticatedLayout
      title={isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}
      subtitle={isEdit ? `Atualizando informações de ${property?.name || '...'}` : 'Preencha os dados abaixo para cadastrar um novo anúncio no HUB.'}
    >
      <form onSubmit={handleSubmit} onInvalidCapture={handleInvalid} className="max-w-5xl space-y-10">

        {/* Seção 1: Dados Básicos */}
        <div className="bg-white rounded-xl border border-slate-300 p-8 lg:p-10 space-y-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <span className="w-8 h-[1px] bg-blue-600"></span> Informações Principais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Título do Anúncio</label>
              <input
                type="text"
                required
                minLength="10"
                maxLength="100"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Apartamento Vista Mar Premium"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo de Imóvel</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
              >
                {Object.keys(PROPERTY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valor de Venda</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                  <i className="fa-solid fa-tag text-blue-600 text-sm"></i>
                </div>
                <input
                  type="text"
                  required
                  value={formatCurrency(formData.value)}
                  onChange={handlePriceChange}
                  placeholder="0,00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-14 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Área Privativa (m²)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Ex: 85"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Total de Quartos</label>
              <input
                type="number"
                required
                min="1"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="Ex: 3"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>


          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Memorial Descritivo</label>
            <textarea
              rows="5"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as características e diferenciais do imóvel..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Seção 2: Localização */}
        <div className="bg-white rounded-xl border border-slate-300 p-8 lg:p-10 space-y-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <span className="w-8 h-[1px] bg-blue-600"></span> Localização do Imóvel
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                Busca de CEP
                {isFetchingCep && <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-[10px]"></i>}
              </label>
              <input
                type="text"
                value={cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength="9"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Estado (UF)</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                maxLength="2"
                placeholder="SC"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cidade</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Joinville"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço Completo</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua das Flores, 123 - Centro"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Galeria de Imagens */}
        <div className="bg-white rounded-xl border border-slate-300 p-8 lg:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 shrink-0">
              <span className="w-8 h-[1px] bg-blue-600"></span> Galeria de Fotos
            </h3>

            {!isEdit && (
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-3 shrink-0 active:scale-95">
                {isUploadingToCloud ? <i className="fa-solid fa-circle-notch animate-spin text-sm"></i> : <i className="fa-solid fa-cloud-arrow-up text-sm"></i>}
                {isUploadingToCloud ? 'Subindo Nuvem...' : 'Upload'}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleCloudinaryUpload} disabled={isUploadingToCloud} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {formData.imageUrls?.split(',').filter(u => u).map((url, idx) => (
              <div
                key={idx}
                draggable={!isEdit}
                onDragStart={!isEdit ? () => handleDragStart(idx) : undefined}
                onDragOver={!isEdit ? handleDragOver : undefined}
                onDrop={!isEdit ? () => handleDrop(idx) : undefined}
                className={`
                  relative aspect-square group overflow-hidden rounded-xl border-2 transition-all ${!isEdit ? 'cursor-move' : ''}
                  ${draggedIdx === idx ? 'opacity-50 scale-95 border-blue-600' : 'border-slate-100'} ${!isEdit ? 'hover:border-blue-600' : ''}
                `}
              >
                <img src={url} alt="Room" className="w-full h-full object-cover" />

                {/* Badge de Foto Principal */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg shadow-blue-500/30">
                    Principal
                  </div>
                )}

                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      const urls = formData.imageUrls.split(',').filter(u => u !== url);
                      setFormData({ ...formData, imageUrls: urls.join(',') });
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-600 cursor-pointer"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                )}
              </div>
            ))}

            {!formData.imageUrls && (
              <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                <i className="fa-regular fa-images text-3xl mb-3"></i>
                <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma foto enviada</p>
              </div>
            )}
          </div>
        </div>

        {/* Mensagens e Ações */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
            <i className="fa-solid fa-circle-check"></i> Imóvel salvo com sucesso! Redirecionando...
          </div>
        )}

        <div className="flex items-center justify-end pt-10 border-t border-slate-100 gap-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saveMutation.isLoading}
            className="flex items-center justify-center gap-2 px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full transition-all active:scale-95 disabled:opacity-50"
          >
            {saveMutation.isLoading ? (
              <i className="fa-solid fa-circle-notch animate-spin text-sm"></i>
            ) : (
              <i className="fa-solid fa-check text-sm"></i>
            )}
            {saveMutation.isLoading ? 'Salvando...' : (isEdit ? 'Confirmar Alterações' : 'Cadastrar Imóvel')}
          </button>
        </div>
      </form>
    </AuthenticatedLayout>
  );
};

export default PropertyForm;
