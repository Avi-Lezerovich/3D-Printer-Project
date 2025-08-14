import React from 'react';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const Panel: React.FC<PanelProps> = ({ title, actions, as: Tag = 'section', children, ...rest }) => {
  const Component = Tag as unknown as React.ElementType;
  return (
    <Component className="panel" {...rest}>
      {(title || actions) && (
        <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          {title && <h2 style={{margin:0, fontSize:'1.05rem'}}>{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </Component>
  );
};

export default Panel;
