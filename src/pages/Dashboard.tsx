import { useState, useEffect } from 'react';
import { Bell, Calendar, Home, Truck, X, ChevronLeft, ChevronRight, Zap, Wifi, PawPrint, CreditCard, Landmark, Droplets, Building2, Video, ShoppingBag, User, Building, Fuel, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Transaction {
    id: number;
    category: string;
    categoryId?: string;
    amount: number;
    icon: any; // Can be string (ID) or Component
    color: string;
    date: string;
    time: string;
    dueDate?: string;
    paid: boolean;
    installments?: number;
    description?: string;
}

const getIcon = (iconName: any) => {
    if (typeof iconName !== 'string') return iconName;

    // Map of ID/Name to Component
    const iconMap: Record<string, any> = {
        'billy': PawPrint,
        'carro': Truck,
        'internet': Wifi,
        'energia': Zap,
        'casa': Home,
        'condominio': Home,
        'mercado': ShoppingBag,
        'lazer': Video,
        'transporte': Truck,
        'credcard': CreditCard,
        'itau-sig': Landmark,
        'itau_signature': Landmark,
        'itau-click': CreditCard,
        'click_itau': CreditCard,
        'nubank': CreditCard,
        'shell': Droplets,
        'apartamento': Building2,
        'financiamento_apto': Building2,
        'emprestimos': Landmark,
        'aline': User
    };

    return iconMap[iconName] || CreditCard;
};

const getCategoryColor = (category: string) => {
    // Normalizing keys to match iconMap somewhat or just direct mapping
    const colorMap: Record<string, string> = {
        'billy': '#f59e0b',
        'carro': '#8b5cf6',
        'internet': '#6366f1',
        'energia': '#eab308',
        'casa': '#ec4899',
        'condominio': '#3b82f6',
        'mercado': '#f59e0b',
        'lazer': '#ec4899',
        'transporte': '#00d09c',
        'credcard': '#8b5cf6',
        'itau-sig': '#ea580c',
        'itau_signature': '#ea580c',
        'itau-click': '#f97316',
        'click_itau': '#f97316',
        'nubank': '#820ad1',
        'shell': '#eab308',
        'apartamento': '#6366f1',
        'financiamento_apto': '#0ea5e9',
        'emprestimos': '#10b981',
        'aline': '#ec4899'
    };

    // Fallback based on simple string matching if needed, or default
    const key = category.toLowerCase().replace(/\s+/g, '_');
    return colorMap[key] || colorMap[category] || '#888';
};

const mapSupabaseTransaction = (t: any): Transaction => {
    // Helper to extract time from created_at or date
    const dateObj = new Date(t.date || t.created_at);
    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Infer color/icon from category if not present
    const color = t.color || getCategoryColor(t.category);
    // If icon is a string in DB, use it, otherwise infer
    const icon = t.icon || t.category.toLowerCase().replace(/\s+/g, '_'); // fallback for getIcon

    return {
        id: t.id,
        category: t.category,
        categoryId: t.categoryId || t.category.toLowerCase(),
        amount: t.amount,
        icon: icon,
        color: color,
        date: dateStr,
        time: timeStr,
        dueDate: t.due_date || t.dueDate || dateStr, // Fallback to date if no due date
        paid: t.paid,
        installments: t.installments,
        description: t.description
    };
};

export default function Dashboard() {
    const [filter, setFilter] = useState('Hoje');
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Load transactions from Supabase
    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped = data.map(mapSupabaseTransaction);
                setTransactions(mapped);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            // Fallback to local storage or empty if offline/error?
            // keeping it simple for now
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: number) => {
        // Optimistic update
        const originalTransactions = [...transactions];
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, paid: true } : t));

        try {
            const { error } = await supabase
                .from('transactions')
                .update({ paid: true })
                .eq('id', id);

            if (error) throw error;

            const trans = transactions.find(t => t.id === id);
            if (trans) {
                const savedCats = localStorage.getItem('budget_categories');
                if (savedCats) {
                    const categories = JSON.parse(savedCats);
                    const amt = Math.abs(trans.amount);
                    const updatedCats = categories.map((c: any) => {
                        if (c.name === trans.category || c.id.toString() === trans.categoryId) {
                            return { ...c, spent: Math.max(0, c.spent - amt) };
                        }
                        return c;
                    });
                    localStorage.setItem('budget_categories', JSON.stringify(updatedCats));
                }
            }

        } catch (error) {
            console.error('Error updating paid status:', error);
            // Revert
            setTransactions(originalTransactions);
            alert('Erro ao atualizar status de pagamento');
        }
    };

    const getDueDateLabel = (dueDate?: string) => {
        if (!dueDate) return null;
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        if (dueDate === today) return 'Vence hoje';
        if (dueDate === tomorrowStr) return 'Vence amanhã';
        return null;
    };

    const filteredTransactions = transactions.filter((t: Transaction) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === selectedMonth.getMonth() && tDate.getFullYear() === selectedMonth.getFullYear();
    });

    const totalExpense = filteredTransactions.filter((t: Transaction) => t.amount < 0).reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);

        const now = new Date();
        // Prevent navigating to future months relative to "today" context (can't see inside next month until it starts)
        // Check if newDate year/month is greater than current
        if (newDate.getFullYear() > now.getFullYear() ||
            (newDate.getFullYear() === now.getFullYear() && newDate.getMonth() > now.getMonth())) {
            return;
        }

        setSelectedMonth(newDate);
    };

    const isCurrentMonth = () => {
        const now = new Date();
        return selectedMonth.getMonth() === now.getMonth() &&
            selectedMonth.getFullYear() === now.getFullYear();
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
        for (let day = 1; day <= daysInMonth; day++) days.push(day);
        return days;
    };

    const getTransactionsForDay = (day: number) => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return transactions.filter(t => t.date === dateStr);
    };

    const getTotalForDay = (day: number) => {
        const dayTransactions = getTransactionsForDay(day);
        return dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    };

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '14px' }}>👤</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>Transações <span style={{ color: '#ef4444', fontSize: '12px' }}>v3.0</span></span>
                </div>
                <button
                    onClick={loadTransactions}
                    style={{ marginRight: '8px', padding: '8px', backgroundColor: '#1E1E1E', borderRadius: '12px', border: 'none', cursor: 'pointer', color: '#00d09c', fontSize: '10px' }}>
                    🔄 Atualizar
                </button>
                <button style={{ padding: '8px', backgroundColor: '#1E1E1E', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
                    <Bell size={20} color="#fff" />
                </button>
            </div>

            {/* Main Card */}
            <div style={{
                background: 'linear-gradient(135deg, #00d09c 0%, #00b080 100%)',
                borderRadius: '24px',
                padding: '24px',
                marginBottom: '24px',
                color: '#fff',
                boxShadow: '0 10px 20px rgba(0, 208, 156, 0.2)'
            }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Gasto Este Mês</div>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>R$ {Math.abs(totalExpense).toFixed(2).replace('.', ',')}</div>
                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>12%</span>
                    <span>vs mês passado</span>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['Hoje', 'Ontem', 'Esta Semana'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            backgroundColor: filter === f ? '#00d09c' : '#1E1E1E',
                            color: filter === f ? '#000' : '#888',
                            fontWeight: 600,
                            fontSize: '13px',
                            border: filter === f ? 'none' : '1px solid #333',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                        }}
                    >
                        {f}
                    </button>
                ))}
                <button
                    onClick={() => setShowCalendar(true)}
                    style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#1E1E1E', border: '1px solid #333', cursor: 'pointer' }}
                >
                    <Calendar size={18} color="#888" />
                </button>
            </div>

            {/* Transaction List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: '#666', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' }).toUpperCase()}
                </div>

                {loading ? (
                    <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>Carregando...</div>
                ) : filteredTransactions.map((t: Transaction) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#1E1E1E', borderRadius: '20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                backgroundColor: `${t.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {(() => {
                                    const IconComp = getIcon(t.icon);
                                    return <IconComp size={24} color={t.color} />;
                                })()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {t.category}
                                    {getDueDateLabel(t.dueDate) && (
                                        <span style={{ fontSize: '10px', backgroundColor: '#ef444420', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>
                                            {getDueDateLabel(t.dueDate)}
                                        </span>
                                    )}
                                </div>
                                <div style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {t.time} • {(t as any).installments ? `${(t as any).installments}x • ` : ''}
                                    {!t.paid && t.amount < 0 && (
                                        <button
                                            onClick={() => handleMarkAsPaid(t.id)}
                                            style={{ background: 'none', border: 'none', color: '#00d09c', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                        >
                                            PAGAR
                                        </button>
                                    )}
                                    {t.paid && (
                                        <span style={{ color: '#00d09c', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            PAGO <Check size={12} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            fontWeight: 700,
                            fontSize: '15px',
                            color: t.paid ? '#666' : (t.amount > 0 ? '#00d09c' : '#fff'),
                            textDecoration: t.paid ? 'line-through' : 'none'
                        }}>
                            {t.amount > 0 ? '+' : ''} R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendar Modal */}
            {
                showCalendar && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px'
                    }}>
                        <div style={{
                            backgroundColor: '#050505',
                            borderRadius: '24px',
                            padding: '24px',
                            maxWidth: '480px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            {/* Calendar Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Registro de Gastos</h2>
                                <button
                                    onClick={() => setShowCalendar(false)}
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

                            {/* Month Navigation */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <button
                                    onClick={() => changeMonth(-1)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: '#1E1E1E',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ChevronLeft size={20} color="#888" />
                                </button>
                                <span style={{ fontSize: '16px', fontWeight: 600 }}>
                                    {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                                </span>
                                <button
                                    onClick={() => changeMonth(1)}
                                    disabled={isCurrentMonth()}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: isCurrentMonth() ? '#111' : '#1E1E1E',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: 'none',
                                        cursor: isCurrentMonth() ? 'not-allowed' : 'pointer',
                                        opacity: isCurrentMonth() ? 0.5 : 1
                                    }}
                                >
                                    <ChevronRight size={20} color="#888" />
                                </button>
                            </div>

                            {/* Day names */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
                                {dayNames.map(day => (
                                    <div key={day} style={{ textAlign: 'center', fontSize: '11px', color: '#666', fontWeight: 600 }}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                                {getDaysInMonth(selectedMonth).map((day, index) => {
                                    if (day === null) {
                                        return <div key={`empty-${index}`} />;
                                    }

                                    const dayTotal = getTotalForDay(day);
                                    const hasTransactions = dayTotal !== 0;
                                    const now = new Date();
                                    const isToday = day === now.getDate() &&
                                        selectedMonth.getMonth() === now.getMonth() &&
                                        selectedMonth.getFullYear() === now.getFullYear();

                                    return (
                                        <div
                                            key={day}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '12px',
                                                backgroundColor: isToday ? '#00d09c20' : (hasTransactions ? '#1E1E1E' : 'transparent'),
                                                border: isToday ? '1px solid #00d09c' : 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                minHeight: '60px',
                                                position: 'relative'
                                            }}
                                        >
                                            <span style={{
                                                fontSize: '14px',
                                                fontWeight: isToday ? 700 : 600,
                                                color: isToday ? '#00d09c' : '#fff'
                                            }}>
                                                {day}
                                            </span>
                                            {hasTransactions && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    color: dayTotal > 0 ? '#00d09c' : '#ef4444'
                                                }}>
                                                    R$ {Math.abs(dayTotal).toFixed(0)}
                                                </span>
                                            )}
                                            {hasTransactions && (
                                                <div style={{
                                                    width: '4px',
                                                    height: '4px',
                                                    borderRadius: '50%',
                                                    backgroundColor: dayTotal > 0 ? '#00d09c' : '#ef4444',
                                                    position: 'absolute',
                                                    bottom: '4px'
                                                }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary */}
                            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#1E1E1E', borderRadius: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>RESUMO DO MÊS</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#fff' }}>Total de Gastos</span>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>
                                        R$ {Math.abs(totalExpense).toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', color: '#fff' }}>Total de Receitas</span>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#00d09c' }}>
                                        R$ 4.500,00
                                    </span>
                                </div>
                                <div style={{ height: '1px', backgroundColor: '#333', margin: '12px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Saldo</span>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#00d09c' }}>
                                        R$ {(4500 + totalExpense).toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
