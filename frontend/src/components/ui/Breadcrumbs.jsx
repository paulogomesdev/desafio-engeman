import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Breadcrumbs Component - Minimalist List
 * Clean version without internal margins/backgrounds for perfect alignment.
 */
const Breadcrumbs = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center">
      <ul className="flex flex-wrap items-center gap-2.5 text-slate-400 text-[10px] lg:text-[11px] font-black uppercase tracking-widest leading-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {item.path && !isLast ? (
                <li
                  className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2.5"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                  <i className="fa-solid fa-chevron-right text-[8px] opacity-40"></i>
                </li>
              ) : (
                <li className="text-slate-900 truncate max-w-[150px] lg:max-w-none">
                  {item.label}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
