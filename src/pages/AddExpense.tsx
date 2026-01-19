import { useState } from 'react';
import { ChevronLeft, Truck, Home, X, Camera, Zap, Wifi, User, PawPrint, CreditCard, Droplets, Building2, Landmark, Calendar, Fuel } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const allCategories = [
    { id: 'condominio', name: 'Condomínio', icon: Home, color: '#3b82f6' },
    { id: 'billy', name: 'Billy', icon: PawPrint, color: '#f59e0b' },
    { id: 'carro', name: 'Financiamento car', icon: Truck, color: '#8b5cf6' },
    { id: 'internet', name: 'Teleson Internet', icon: Wifi, color: '#6366f1' },
    { id: 'energia', name: 'Conta de Energia', icon: Zap, color: '#eab308' },
    { id: 'aline', name: 'Aline Veloso', icon: User, color: '#ec4899' },
    // Merged categories from HEAD and Remote
    { id: 'credcard', name: 'Credcard', icon: CreditCard, color: '#8b5cf6' },
    { id: 'itau_signature', name: 'Itaú signature', icon: CreditCard, color: '#ea580c' },
    { id: 'click_itau', name: 'Cartão Click Itáu', icon: CreditCard, color: '#f97316' },
    { id: 'nubank', name: 'Cartão Nubank', icon: CreditCard, color: '#820ad1' },
    { id: 'shell', name: 'Posto Shell', icon: Fuel, color: '#eab308' },
    { id: 'financiamento_apto', name: 'Financiamento Apartamento', icon: Building2, color: '#0ea5e9' },
    { id: 'emprestimos', name: 'Empréstimos', icon: Landmark, color: '#10b981' },
];

export default function AddExpense() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('0');
    const [selectedCategory, setSelectedCategory] = useState(allCategories[0].id);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [recentCategories, setRecentCategories] = useState<string[]>([
        'condominio', 'billy', 'carro', 'credcard', 'nubank', 'shell'
    ]);
    const [photoName, setPhotoName] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [installments, setInstallments] = useState<string>('1');
    const [loading, setLoading] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    // Check if selected category is a credit card
    const isCreditCard = ['credcard', 'itau_signature', 'click_itau', 'nubank', 'itau-sig', 'itau-click'].includes(selectedCategory) ||
        allCategories.find(c => c.id === selectedCategory)?.name.toLowerCase().includes('cartão');

    const handleKeyPress = (key: string) => {
        if (key === 'back') {
            setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else if (key === ',') {
            if (!amount.includes(',')) setAmount(prev => prev + ',');
        } else {
            setAmount(prev => prev === '0' ? key : prev + key);
        }
    };

    const handleSave = async () => {
        const floatAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(floatAmount) || floatAmount <= 0) return;

        try {
            setLoading(true);

            // Supabase Logic
            const { error } = await supabase
                .from('transactions')
                .insert({
                    category: selectedCategory,
                    amount: -floatAmount, // Expense is negative
                    date: new Date().toISOString().split('T')[0], // Using YYYY-MM-DD
                    due_date: dueDate,
                    created_at: new Date().toISOString(), // Keep precision for sorting
                    type: 'expense',
                    // photo_name: photoName || null, // Assuming table has this
                    description: allCategories.find(c => c.id === selectedCategory)?.name || 'Despesa',
                    paid: false,
                    installments: isCreditCard ? parseInt(installments) : 1
                });

            if (error) throw error;

            // Also update local storage for seamless offline/transition support if needed?
            // Prioritizing Supabase but maintaining "Update Category Spending" logic for immediate UI feedback if relying on local state somewhere?
            // Actually, best to rely on Supabase, but the user's previous HEAD had local updates.
            // I'll keep the local 'budget' update logic as a nice-to-have for the 'BudgetGoals' page if it's still using local storage primarily.

            const savedCats = localStorage.getItem('budget_categories');
            if (savedCats) {
                const categoryObj = allCategories.find(c => c.id === selectedCategory);
                const categories = JSON.parse(savedCats);
                const updatedCats = categories.map((c: any) => {
                    if (c.name === categoryObj?.name || c.id.toString() === selectedCategory) {
                        return { ...c, spent: c.spent + floatAmount };
                    }
                    return c;
                });
                localStorage.setItem('budget_categories', JSON.stringify(updatedCats));
            }

            navigate('/');
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Erro ao salvar transação: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setShowAllCategories(false);

        // Reset installments to 1 when changing category
        setInstallments('1');

        // Update recent categories - add to front, remove duplicates, keep max 6
        setRecentCategories(prev => {
            const filtered = prev.filter(id => id !== categoryId);
            return [categoryId, ...filtered].slice(0, 6);
        });
    };

    // Get the categories to display in the quick selection
    const displayedCategories = recentCategories
        .map(id => allCategories.find(cat => cat.id === id))
        .filter(cat => cat !== undefined);

    return (
        <div style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/" style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Categorias de Despesa</h1>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>👤</span>
                </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
                <div style={{ color: '#888', fontSize: '14px' }}>Total Gasto</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>R$ 3.240,50</div>
                    <div style={{ backgroundColor: '#1E1E1E', color: '#00d09c', fontSize: '12px', padding: '4px 12px', borderRadius: '12px' }}>
                        12% do orçamento
                    </div>
                </div>
                <div style={{ height: '4px', backgroundColor: '#333', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '12%', backgroundColor: '#00d09c' }} />
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600 }}>Selecione a Categoria</span>
                    <button
                        onClick={() => setShowAllCategories(true)}
                        style={{ color: '#00d09c', fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Gerenciar
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {displayedCategories.map((cat) => (
                        <button
                            key={cat!.id}
                            onClick={() => handleCategorySelect(cat!.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                borderRadius: '16px',
                                backgroundColor: selectedCategory === cat!.id ? cat!.color : '#1E1E1E',
                                color: selectedCategory === cat!.id ? '#fff' : '#888',
                                transition: 'all 0.2s',
                                minWidth: 'max-content',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <cat!.icon size={18} />
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{cat!.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ margin: 'auto 0', fontSize: '48px', fontWeight: 700, display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '24px', marginTop: '8px', color: '#888', marginRight: '4px' }}>R$</span>
                    {amount}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    width: '100%',
                    marginBottom: '24px'
                }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, 'back'].map((key) => (
                        <button
                            key={key}
                            onClick={() => handleKeyPress(key.toString())}
                            style={{
                                height: '64px',
                                fontSize: '24px',
                                fontWeight: 600,
                                color: key === 'back' ? '#ef4444' : '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {key === 'back' ? <ChevronLeft /> : key}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '0 24px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>DATA DE VENCIMENTO</div>
                    <input
                        type="date"
                        value={dueDate}
                        readOnly // Using calendar modal for interaction
                        onClick={() => setShowCalendar(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#1E1E1E',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    />
                </div>
                {isCreditCard && (
                    <div style={{ width: '100px' }}>
                        <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>PARCELAS</div>
                        <input
                            type="number"
                            min="1"
                            value={installments}
                            onChange={(e) => setInstallments(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#1E1E1E',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                textAlign: 'center',
                                outline: 'none'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Photo Upload - Option added as requested */}

            <div style={{ padding: '0 24px', marginBottom: '16px' }}>
                <button
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    style={{
                        width: '100%',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: photoName ? '#00d09c20' : '#1E1E1E',
                        borderRadius: '16px',
                        border: photoName ? '1px solid #00d09c' : 'none',
                        color: photoName ? '#00d09c' : '#888',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                >
                    <Camera size={20} />
                    <span>{photoName ? 'Foto Adicionada' : 'Adicionar Foto / Comprovante'}</span>
                </button>
                <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setPhotoName(file.name);
                        }
                    }}
                />
            </div>

            {/* Installments Selector - Only for Credit Cards */}
            {isCreditCard && (
                <div style={{ padding: '0 24px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>
                        PARCELAMENTO
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px'
                    }}>
                        {[1, 2, 3, 4, 6, 8, 10, 12].map((num) => (
                            <button
                                key={num}
                                onClick={() => setInstallments(num.toString())}
                                style={{
                                    padding: '12px 8px',
                                    backgroundColor: parseInt(installments) === num ? '#00d09c' : '#1E1E1E',
                                    color: parseInt(installments) === num ? '#000' : '#fff',
                                    border: parseInt(installments) === num ? 'none' : '1px solid #333',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {num}x
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '18px',
                    backgroundColor: loading ? '#053d2e' : '#00d09c',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '16px',
                    borderRadius: '24px',
                    marginBottom: '16px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Salvando...' : 'Salvar Transação'}
            </button>

            {/* All Categories Modal */}
            {showAllCategories && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '480px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Todas as Categorias</h2>
                            <button
                                onClick={() => setShowAllCategories(false)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#1E1E1E',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} color="#fff" />
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            paddingBottom: '80px'
                        }}>
                            {allCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        backgroundColor: selectedCategory === cat.id ? cat.color : '#1E1E1E',
                                        color: selectedCategory === cat.id ? '#fff' : '#888',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        backgroundColor: selectedCategory === cat.id ? 'rgba(255,255,255,0.2)' : `${cat.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <cat.icon size={20} color={selectedCategory === cat.id ? '#fff' : cat.color} />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '15px', flex: 1, textAlign: 'left' }}>{cat.name}</span>
                                    {selectedCategory === cat.id && (
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>✓</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Modal */}
            {showCalendar && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{
                        backgroundColor: '#1E1E1E',
                        borderRadius: '24px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Selecionar Data de Vencimento</h2>
                            <button
                                onClick={() => setShowCalendar(false)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} color="#fff" />
                            </button>
                        </div>

                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => {
                                setDueDate(e.target.value);
                                setShowCalendar(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '16px',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
