import { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronLeft, ChevronRight, Check, AlertCircle, Clock, Smartphone, Zap, Wifi, Landmark, User, PawPrint, CreditCard, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Expense {
    id: string;
    amount: number;
    due_date: string;
    paid: boolean;
    description?: string;
    current_installment?: number;
    total_installments?: number;
    is_fixed: boolean;
    category: {
        name: string;
        icon: string;
        color: string;
    };
}

const iconMap: Record<string, any> = {
    'Zap': Zap,
    'Wifi': Wifi,
    'Smartphone': Smartphone,
    'Landmark': Landmark,
    'User': User,
    'PawPrint': PawPrint,
    'CreditCard': CreditCard,
    'Calendar': Calendar,
    'PlusCircle': PlusCircle
};

export default function Dashboard() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    useEffect(() => {
        loadExpenses();
    }, [selectedMonth]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).toISOString();
            const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).toISOString();

            const { data, error } = await supabase
                .from('expenses')
                .select(`
                    *,
                    category:category_id (name, icon, color)
                `)
                .gte('due_date', firstDay.split('T')[0])
                .lte('due_date', lastDay.split('T')[0])
                .order('due_date', { ascending: true });

            if (error) throw error;
            setExpenses(data || []);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .update({
                    paid: true,
                    paid_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: true } : e));
        } catch (error) {
            console.error('Error updating payment:', error);
            alert('Erro ao confirmar pagamento');
        }
    };

    const getStatusInfo = (expense: Expense) => {
        if (expense.paid) return { label: 'PAGO', color: '#00d09c', icon: Check };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [year, month, day] = expense.due_date.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return { label: 'VENCE HOJE', color: '#ef4444', icon: AlertCircle };
        if (diffDays === 1) return { label: 'VENCE AMANHÃ', color: '#f59e0b', icon: Clock };
        if (diffDays === 2) return { label: 'VENCE EM 2 DIAS', color: '#f59e0b', icon: Clock };
        if (diffDays < 0) return { label: 'PENDENTE', color: '#ef4444', icon: AlertCircle };

        const formattedDay = String(dueDate.getDate()).padStart(2, '0');
        return { label: `Vence dia ${formattedDay}`, color: '#6B7280', icon: Calendar };
    };

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPaid = expenses.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0);

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedMonth(newDate);
    };

    return (
        <div style={{ padding: '24px', paddingBottom: '100px', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>Controle de Gastos</h1>
                <button style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '12px', border: 'none' }}>
                    <Bell size={20} color="#1F2937" />
                </button>
            </div>

            {/* Month Summary Card */}
            <div style={{
                background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                borderRadius: '24px',
                padding: '24px',
                marginBottom: '24px',
                color: '#fff',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', color: '#9CA3AF' }}><ChevronLeft size={20} /></button>
                    <span style={{ fontWeight: 600 }}>{monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}</span>
                    <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', color: '#9CA3AF' }}><ChevronRight size={20} /></button>
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>Total do Mês</div>
                <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>R$ {totalSpent.toFixed(2).replace('.', ',')}</div>
                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(totalPaid / totalSpent || 0) * 100}%`, backgroundColor: '#00d09c', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                    <span>Pago: R$ {totalPaid.toFixed(2).replace('.', ',')}</span>
                    <span>Restante: R$ {(totalSpent - totalPaid).toFixed(2).replace('.', ',')}</span>
                </div>
            </div>

            {/* Expense List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '4px' }}>Meus Gastos</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Carregando...</div>
                ) : expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', backgroundColor: '#F9FAFB', borderRadius: '16px' }}>
                        Nenhum gasto registrado neste mês.
                    </div>
                ) : expenses.map((expense) => {
                    const status = getStatusInfo(expense);
                    const StatusIcon = status.icon;
                    const CategoryIcon = iconMap[expense.category.icon] || CreditCard;

                    return (
                        <div key={expense.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '20px',
                            border: '1px solid #F3F4F6'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '16px',
                                    backgroundColor: `${expense.category.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CategoryIcon size={24} color={expense.category.color} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#1F2937' }}>
                                        {expense.category.name}
                                        {expense.total_installments && expense.total_installments > 1 && (
                                            <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '6px' }}>
                                                ({expense.current_installment}/{expense.total_installments})
                                            </span>
                                        )}
                                        {expense.is_fixed && (
                                            <span style={{ fontSize: '10px', color: '#3b82f6', backgroundColor: '#3b82f615', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>FIXA</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <StatusIcon size={12} color={status.color} />
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: status.color }}>{status.label}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                <div style={{ fontWeight: 700, fontSize: '15px', color: expense.paid ? '#9CA3AF' : '#1F2937', textDecoration: expense.paid ? 'line-through' : 'none' }}>
                                    R$ {expense.amount.toFixed(2).replace('.', ',')}
                                </div>
                                {!expense.paid && (
                                    <button
                                        onClick={() => handleMarkAsPaid(expense.id)}
                                        style={{
                                            padding: '6px 14px',
                                            backgroundColor: '#00d09c',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        PAGAR
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

