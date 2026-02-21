// Placeholder component until Shadcn Tabs are fully implemented
export function Tabs({ children, className }) {
    return <div className={className}>{children}</div>;
}
  
export function TabsList({ children, className }) {
    return <div className={`flex space-x-2 border-b border-gray-700 mb-4 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, onClick, active, children }) {
    return (
        <button
            onClick={() => onClick(value)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 
            ${active 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, activeTab, children }) {
    if (value !== activeTab) return null;
    return <div className="animate-in fade-in zoom-in duration-200">{children}</div>;
}
