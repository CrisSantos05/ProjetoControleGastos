import { useState, useEffect } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Lightbulb, Pencil, Check, X } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const colors = ['#3b82f6', '#8b5cf6', '#00d09c', '#f59e0b'];

interface Transaction {
    id: number;
    amount: number;
    date: string; // YYYY-MM-DD
    category: string;
    type: string;
    description?: string;
}

interface BudgetCategory {
    id: string;
    name: string;
    budget: number;
    color: string;
}

const defaultBudgets: BudgetCategory[] = [
    { id: 'credcard', name: 'Credcard', budget: 1000, color: '#8b5cf6' },
    { id: 'itau_signature', name: 'Itaú Signature', budget: 2000, color: '#ea580c' },
    { id: 'click_itau', name: 'Click Itaú', budget: 1500, color: '#f97316' },
    { id: 'nubank', name: 'Nubank', budget: 800, color: '#820ad1' },
    { id: 'shell', name: 'Posto Shell', budget: 400, color: '#eab308' }
];

export default function Analytics() {
    const [period, setPeriod] = useState('Mensal');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [dateRange, setDateRange] = useState('');
    const [loading, setLoading] = useState(true);

    // Budget Editing State
    const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
        const saved = localStorage.getItem('analytics_budgets');
        return saved ? JSON.parse(saved) : defaultBudgets;
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Save budgets when changed
    useEffect(() => {
        localStorage.setItem('analytics_budgets', JSON.stringify(budgets));
    }, [budgets]);

    // Initial fetch
    useEffect(() => {
        loadTransactions();
    }, []);

    // Recalculate when transactions or period changes
    useEffect(() => {
        processData();
    }, [transactions, period]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = () => {
        if (!transactions.length) return;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let filteredTransactions: Transaction[] = [];
        let dataMap = new Map<string, number>();
        let xAxisOrder: string[] = [];
        let start: Date, end: Date;

        if (period === 'Semanal') {
            // Current week (Sunday to Saturday)
            const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
            start = new Date(now);
            start.setDate(now.getDate() - dayOfWeek);
            start.setHours(0, 0, 0, 0);

            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);

            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            xAxisOrder = days;
            days.forEach(d => dataMap.set(d, 0));

            filteredTransactions = transactions.filter(t => {
                const tDate = new Date(t.date + 'T12:00:00'); // Fix timezone offset issues
                return tDate >= start && tDate <= end && t.amount < 0; // Expenses only
            });

            filteredTransactions.forEach(t => {
                const tDate = new Date(t.date + 'T12:00:00');
                const dayName = days[tDate.getDay()];
                dataMap.set(dayName, (dataMap.get(dayName) || 0) + Math.abs(t.amount));
            });

        } else if (period === 'Mensal') {
            // Current Month, split by weeks
            start = new Date(currentYear, currentMonth, 1);
            end = new Date(currentYear, currentMonth + 1, 0);

            xAxisOrder = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
            xAxisOrder.forEach(w => dataMap.set(w, 0));

            filteredTransactions = transactions.filter(t => {
                const tDate = new Date(t.date + 'T12:00:00');
                return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear && t.amount < 0;
            });

            filteredTransactions.forEach(t => {
                const tDate = new Date(t.date + 'T12:00:00');
                const day = tDate.getDate();
                const weekNum = Math.ceil(day / 7);
                const weekLabel = `Sem ${weekNum}`;
                if (dataMap.has(weekLabel)) {
                    dataMap.set(weekLabel, (dataMap.get(weekLabel) || 0) + Math.abs(t.amount));
                }
            });

        } else {
            // Annual (Jan - Dec)
            start = new Date(currentYear, 0, 1);
            end = new Date(currentYear, 11, 31);

            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            xAxisOrder = months;
            months.forEach(m => dataMap.set(m, 0));

            filteredTransactions = transactions.filter(t => {
                const tDate = new Date(t.date + 'T12:00:00');
                return tDate.getFullYear() === currentYear && t.amount < 0;
            });

            filteredTransactions.forEach(t => {
                const tDate = new Date(t.date + 'T12:00:00');
                const monthName = months[tDate.getMonth()];
                dataMap.set(monthName, (dataMap.get(monthName) || 0) + Math.abs(t.amount));
            });
        }

        // Finalize Data
        const finalChartData = xAxisOrder.map(name => ({
            name,
            value: dataMap.get(name) || 0
        }));

        const total = filteredTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

        setChartData(finalChartData);
        setTotalSpent(total);
        setDateRange(`${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`);
    };

    const handleEditStart = (cat: BudgetCategory) => {
        setEditingId(cat.id);
        setEditValue(cat.budget.toString());
    };

    const handleEditSave = (id: string) => {
        const newBudget = parseFloat(editValue);
        if (!isNaN(newBudget)) {
            setBudgets(budgets.map(b => b.id === id ? { ...b, budget: newBudget } : b));
        }
        setEditingId(null);
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/" style={{ color: '#fff' }}>
                    <ChevronLeft size={24} />
                </Link>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Análise de Orçamento</span>
                <CalendarIcon size={20} color="#888" />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{ backgroundColor: '#1E1E1E', padding: '4px', borderRadius: '14px', display: 'flex' }}>
                    {['Anual', 'Mensal', 'Semanal'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '8px 24px',
                                borderRadius: '12px',
                                backgroundColor: period === p ? '#2A2A2A' : 'transparent',
                                color: period === p ? '#00d09c' : '#666',
                                fontWeight: 600,
                                fontSize: '13px',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                border: 'none'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Total Spending */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>TOTAL GASTO ({period.toUpperCase()})</div>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    R$ {totalSpent.toFixed(2).replace('.', ',')}
                </div>
<<<<<<< HEAD
                <div style={{ color: '#666', fontSize: '12px' }}>
                    {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
=======
                <div style={{ color: '#666', fontSize: '12px' }}>{dateRange}</div>
>>>>>>> 8c87a622c3de679d059c87e35cdfcb9532c586e1
            </div>

            {/* Chart */}
            <div style={{ height: '220px', marginBottom: '32px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#1E1E1E', border: 'none', borderRadius: '12px', color: '#fff' }}
<<<<<<< HEAD
                            formatter={(value: any) => [`R$ ${value}`, 'Valor']}
=======
                            // @ts-ignore
                            formatter={(value: any) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Valor']}
>>>>>>> 8c87a622c3de679d059c87e35cdfcb9532c586e1
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#666', fontSize: 10 }}
                            dy={10}
                        />
                        <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Budget vs Actual */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Orçamento vs. Real (Mensal)</h3>
                    <div style={{ fontSize: '12px', color: '#00d09c', display: 'flex', gap: '12px' }}>
                        <span>● Em Dia</span>
                        <span style={{ color: '#ef4444' }}>● Acima</span>
                    </div>
                </div>

                {budgets.map(cat => {
                    // Calculate spent for this category in the current month
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    const spent = transactions
                        .filter(t => {
                            const tDate = new Date(t.date + 'T12:00:00');
                            return t.category === cat.id &&
                                t.amount < 0 &&
                                tDate.getMonth() === currentMonth &&
                                tDate.getFullYear() === currentYear;
                        })
                        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

                    const percent = Math.min((spent / cat.budget) * 100, 100);
                    const isOver = spent > cat.budget;
                    const isEditing = editingId === cat.id;

                    return (
                        <div key={cat.id} style={{ backgroundColor: '#1E1E1E', borderRadius: '20px', padding: '16px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', backgroundColor: `${cat.color}20`, borderRadius: '10px' }}>
                                        <div style={{ width: '16px', height: '16px', backgroundColor: cat.color, borderRadius: '4px' }} />
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                style={{
                                                    backgroundColor: '#333',
                                                    border: '1px solid #444',
                                                    color: '#fff',
                                                    borderRadius: '8px',
                                                    padding: '4px 8px',
                                                    width: '80px',
                                                    textAlign: 'right',
                                                    fontWeight: 700
                                                }}
                                                autoFocus
                                            />
                                            <button onClick={() => handleEditSave(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                                <Check size={16} color="#00d09c" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                                <X size={16} color="#ef4444" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ fontWeight: 700 }}>R$ {cat.budget.toFixed(2).replace('.', ',')}</div>
                                            <button
                                                onClick={() => handleEditStart(cat)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.5 }}
                                            >
                                                <Pencil size={12} color="#fff" />
                                            </button>
                                        </div>
                                    )}
                                    <div style={{ fontSize: '10px', color: isOver ? '#ef4444' : '#00d09c' }}>
                                        {((spent / cat.budget) * 100).toFixed(0)}% Gasto ({spent.toFixed(2).replace('.', ',')})
                                    </div>
                                </div>
                            </div>
                            <div style={{ height: '6px', backgroundColor: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${percent}%`,
                                    height: '100%',
                                    backgroundColor: isOver ? '#ef4444' : cat.color,
                                    borderRadius: '3px'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Smart Insight */}
            <div style={{
                background: 'linear-gradient(135deg, #093028 0%, #237A57 100%)',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                alignItems: 'start',
                gap: '16px'
            }}>
                <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                    <Lightbulb size={24} color="#00d09c" />
                </div>
                <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px', color: '#fff' }}>Insight Inteligente</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4' }}>
                        Você excedeu o orçamento em <span style={{ color: '#f59e0b', fontWeight: 600 }}>Alimentação</span>. Para manter o controle, considere reduzir os pedidos esta semana.
                    </div>
                </div>
            </div>
        </div>
    );
}
