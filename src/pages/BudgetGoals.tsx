import { useState, useEffect } from 'react';
import { ChevronLeft, Home, ShoppingBag, Video, Truck, Plus, Trash2, Edit2, CreditCard, Building2, Landmark, Droplets, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

const initialCategories = [
    { id: 1, name: 'Habitação', spent: 1700, budget: 1800, icon: 'casa', color: '#3b82f6' },
    { id: 2, name: 'Mercado', spent: 650, budget: 650, icon: 'mercado', color: '#f59e0b' },
    { id: 3, name: 'Lazer', spent: 250, budget: 200, icon: 'lazer', color: '#ec4899', warning: 'Gasto Alto' },
    { id: 4, name: 'Transporte', spent: 150, budget: 350, icon: 'transporte', color: '#00d09c' },
    { id: 5, name: 'Credcard', spent: 0, budget: 500, icon: 'credcard', color: '#3b82f6' },
    { id: 6, name: 'Itaú signature', spent: 0, budget: 1000, icon: 'itau-sig', color: '#ec4899' },
    { id: 7, name: 'Cartão Click Itáu', spent: 0, budget: 800, icon: 'itau-click', color: '#f59e0b' },
    { id: 8, name: 'Cartão Nubank', spent: 0, budget: 1200, icon: 'nubank', color: '#8b5cf6' },
    { id: 9, name: 'Posto Shell', spent: 0, budget: 400, icon: 'shell', color: '#eab308' },
    { id: 10, name: 'Financiamento Apartamento', spent: 0, budget: 2500, icon: 'apartamento', color: '#6366f1' },
    { id: 11, name: 'Empréstimos', spent: 0, budget: 1500, icon: 'emprestimos', color: '#3b82f6' },
];

interface Category {
    id: number;
    name: string;
    spent: number;
    budget: number;
    icon: any; // Name of icon or component
    color: string;
    warning?: string;
}

const getIcon = (iconName: any) => {
    if (typeof iconName !== 'string') return iconName;
    const iconMap: Record<string, any> = {
        'casa': Home,
        'mercado': ShoppingBag,
        'lazer': Video,
        'transporte': Truck,
        'credcard': CreditCard,
        'itau-sig': Landmark,
        'itau-click': CreditCard,
        'nubank': CreditCard,
        'shell': Droplets,
        'apartamento': Building2,
        'emprestimos': Landmark,
        'billy': PawPrint, // Added billy for consistency
    };
    return iconMap[iconName] || CreditCard;
};

export default function BudgetGoals() {
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('budget_categories');
        return saved ? JSON.parse(saved) : initialCategories;
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem('budget_categories', JSON.stringify(categories));
    }, [categories]);

    const handleUpdateBudget = (id: number, val: string) => {
        const newCats = categories.map((c: Category) => c.id === id ? { ...c, budget: parseInt(val) || 0 } : c);
        setCategories(newCats);
    };

    const handleUpdateName = (id: number, val: string) => {
        const newCats = categories.map((c: Category) => c.id === id ? { ...c, name: val } : c);
        setCategories(newCats);
    };

    const handleDeleteCategory = (id: number) => {
        setCategories(categories.filter((c: Category) => c.id !== id));
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/" style={{ color: '#fff' }}>
                    <ChevronLeft size={24} />
                </Link>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Definir Metas</span>
                <div style={{ color: '#00d09c', fontSize: '14px', fontWeight: 600 }}>Salvar</div>
            </div>

            <div style={{ backgroundColor: '#1E1E1E', borderRadius: '24px', padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontSize: '14px', color: '#888' }}>Saúde do Orçamento</div>
                        <div style={{ fontSize: '32px', fontWeight: 700 }}>92%</div>
                    </div>
                    <div style={{ color: '#00d09c', fontWeight: 600, fontSize: '14px', backgroundColor: 'rgba(0, 208, 156, 0.1)', padding: '4px 12px', borderRadius: '8px', height: 'fit-content' }}>
                        EXCELENTE
                    </div>
                </div>
                <div style={{ height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ width: '92%', height: '100%', backgroundColor: '#00d09c', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#888' }}>TOTAL ORÇADO</div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>R$ 4.250</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#888' }}>ECONOMIA PROJ.</div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>R$ 1.150</div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>Categorias Ativas</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{categories.length} Ativas</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {categories.map((cat: Category) => (
                    <div key={cat.id} style={{ backgroundColor: '#1E1E1E', borderRadius: '20px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                backgroundColor: `${cat.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {(() => {
                                    const IconComp = getIcon(cat.icon);
                                    return <IconComp size={20} color={cat.color} />;
                                })()}
                            </div>
                            <div style={{ flex: 1 }}>
                                {editingId === cat.id ? (
                                    <input
                                        value={cat.name}
                                        onChange={(e) => handleUpdateName(cat.id, e.target.value)}
                                        onBlur={() => setEditingId(null)}
                                        autoFocus
                                        style={{ fontWeight: 600, borderBottom: '1px solid #00d09c', width: '100%' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ fontWeight: 600 }}>{cat.name}</div>
                                        <Edit2 size={12} color="#666" style={{ cursor: 'pointer' }} onClick={() => setEditingId(cat.id)} />
                                    </div>
                                )}
                                <div style={{ fontSize: '11px', color: '#888' }}>Média: R$ {cat.spent}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Trash2 size={18} color="#ef4444" style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => handleDeleteCategory(cat.id)} />
                                <div style={{
                                    backgroundColor: '#000',
                                    borderRadius: '12px',
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    border: '1px solid #333'
                                }}>
                                    <span style={{ color: '#888', fontSize: '14px' }}>R$</span>
                                    <input
                                        value={cat.budget}
                                        onChange={(e) => handleUpdateBudget(cat.id, e.target.value)}
                                        style={{ width: '50px', fontWeight: 600, textAlign: 'right' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%`, height: '100%', backgroundColor: cat.color }} />
                            </div>
                            {cat.warning && (
                                <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>{cat.warning.toUpperCase()}</div>
                            )}
                            {cat.spent < cat.budget && !cat.warning && (
                                <div style={{ fontSize: '10px', color: '#00d09c', fontWeight: 600 }}>RESTANTE: R$ {cat.budget - cat.spent}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button style={{
                marginTop: '24px',
                width: '100%',
                padding: '16px',
                border: '1px dashed #333',
                borderRadius: '20px',
                color: '#666',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                <Plus size={20} />
                ADICIONAR NOVA CATEGORIA
            </button>
        </div>
    );
}
