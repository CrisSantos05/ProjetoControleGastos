import { useState, useEffect } from 'react';
import { Calendar, Zap, Wifi, Home, CheckCircle, Plus, Truck, User, Pencil, Check, X } from 'lucide-react';

const defaultBills = [
    {
        id: 1,
        name: 'Condomínio',
        type: 'Habitação • Mensal',
        amount: 450.00,
        dueText: 'VENCE DIA 10',
        icon: Home,
        color: '#3b82f6',
        dueSoon: true
    },
    {
        id: 2,
        name: 'Aline Veloso',
        type: '4 Parcelas Restantes',
        amount: 110.00,
        dueText: 'VENCE DIA 12',
        icon: User,
        color: '#ec4899',
        dueSoon: true
    },
    {
        id: 3,
        name: 'Conta de Energia',
        type: 'Utilidades • Mensal',
        amount: 142.50,
        dueText: 'VENCE DIA 18',
        icon: Zap,
        color: '#eab308',
        dueSoon: false
    },
    {
        id: 4,
        name: 'Teleson Internet',
        type: 'Serviço • Mensal',
        amount: 89.90,
        dueText: 'VENCE DIA 19',
        icon: Wifi,
        color: '#6366f1',
        dueSoon: false
    },
    {
        id: 5,
        name: 'Financiamento Carro',
        type: 'Automóvel • Fixo',
        amount: 1124.00,
        dueText: 'MENSAL',
        icon: Truck,
        color: '#8b5cf6',
        dueSoon: false
    }
];

export default function BillReminders() {
    const now = new Date();
    const currentDay = now.getDate();
    const [selectedDay, setSelectedDay] = useState(currentDay);

    // Dynamic Bills State
    const [bills, setBills] = useState(() => {
        const saved = localStorage.getItem('recurring_bills');
        // Need to reconstruct icons because JSON.parse kills functions/components
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((b: any) => ({
                ...b,
                icon: defaultBills.find(db => db.name === b.name)?.icon || Home // Restore icon logic
            }));
        }
        return defaultBills;
    });

    // Editing State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        localStorage.setItem('recurring_bills', JSON.stringify(bills));
    }, [bills]);

    const getDaysForStrip = () => {
        const result = [];
        const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        for (let i = -1; i < 4; i++) {
            const d = new Date();
            d.setDate(now.getDate() + i);
            result.push({
                day: dayNames[d.getDay()],
                date: d.getDate(),
                isToday: i === 0
            });
        }
        return result;
    };

    const days = getDaysForStrip();

    const handleEditStart = (bill: any) => {
        setEditingId(bill.id);
        setEditValue(bill.amount.toString());
    };

    const handleEditSave = (id: number) => {
        const newAmount = parseFloat(editValue.replace(',', '.'));
        if (!isNaN(newAmount)) {
            setBills((prev: any[]) => prev.map(b => b.id === id ? { ...b, amount: newAmount } : b));
        }
        setEditingId(null);
    };

    const getCurrentMonthKey = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const isPaidThisMonth = (bill: any) => {
        return bill.lastPaidMonth === getCurrentMonthKey();
    };

    const handleMarkAsPaid = (id: number) => {
        const monthKey = getCurrentMonthKey();
        setBills((prev: any[]) => prev.map(b => b.id === id ? { ...b, lastPaidMonth: monthKey } : b));
    };

    const renderBillCard = (bill: any) => {
        const isEditing = editingId === bill.id;
        const isPaid = isPaidThisMonth(bill);

        return (
            <div key={bill.id} style={{ backgroundColor: '#1E1E1E', borderRadius: '24px', padding: '20px', opacity: isPaid ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '16px',
                            backgroundColor: bill.dueSoon ? '#162e2e' : '#2A2A2A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <bill.icon size={24} color={bill.dueSoon ? "#00d09c" : "#888"} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '15px' }}>{bill.name}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{bill.type}</div>
                        </div>
                    </div>

                    {/* Edit UI */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    style={{
                                        width: '80px',
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        padding: '4px 8px',
                                        fontSize: '14px'
                                    }}
                                    autoFocus
                                />
                                <button onClick={() => handleEditSave(bill.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                    <Check size={18} color="#00d09c" />
                                </button>
                                <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                    <X size={18} color="#ef4444" />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ fontWeight: 700, fontSize: '16px', textDecoration: isPaid ? 'line-through' : 'none' }}>
                                    R$ {bill.amount.toFixed(2).replace('.', ',')}
                                </div>
                                {!isPaid && (
                                    <button
                                        onClick={() => handleEditStart(bill)}
                                        style={{
                                            background: '#333',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            marginLeft: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Pencil size={16} color="#00d09c" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: bill.dueSoon ? '#f59e0b' : '#666', fontSize: '11px', fontWeight: bill.dueSoon ? 700 : 600 }}>
                        <span style={{ fontSize: '14px' }}>{bill.dueSoon ? '⏰' : '📅'}</span>
                        {bill.dueText}
                    </div>
                    {isPaid ? (
                        <div style={{
                            color: '#00d09c',
                            fontWeight: 700,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#00d09c20',
                            padding: '8px 16px',
                            borderRadius: '12px'
                        }}>
                            PAGO <CheckCircle size={14} />
                        </div>
                    ) : (
                        <button
                            onClick={() => handleMarkAsPaid(bill.id)}
                            style={{
                                backgroundColor: bill.dueSoon ? '#00d09c' : '#2A2A2A',
                                color: bill.dueSoon ? '#053d2e' : '#888',
                                fontWeight: bill.dueSoon ? 700 : 600,
                                fontSize: '12px',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Marcar como Pago
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '24px', paddingBottom: '100px', minHeight: '100vh', position: 'relative' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#00d09c20', padding: '8px', borderRadius: '10px' }}>
                        <span style={{ color: '#00d09c', fontWeight: '800', fontSize: '18px' }}>G</span> {/* Logo placeholder */}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '18px' }}>Lembretes de Contas</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ backgroundColor: '#1E1E1E', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                        <Calendar size={20} color="#888" />
                    </button>
                    <button style={{ backgroundColor: '#00d09c', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                        <Plus size={20} color="#000" />
                    </button>
                </div>
            </div>

            {/* Calendar Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                {days.map((item) => (
                    <div
                        key={item.date}
                        onClick={() => setSelectedDay(item.date)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: item.date === selectedDay ? '#00d09c' : '#1E1E1E',
                            color: item.date === selectedDay ? '#000' : '#888',
                            padding: '12px 0',
                            width: '56px',
                            borderRadius: '24px',
                            transition: 'all 0.2s',
                            boxShadow: item.date === selectedDay ? '0 8px 16px rgba(0, 208, 156, 0.2)' : 'none',
                            border: item.isToday ? '1px solid #00d09c' : 'none'
                        }}
                    >
                        <span style={{ fontSize: '10px', fontWeight: 600, marginBottom: '4px' }}>{item.day}</span>
                        <span style={{ fontSize: '18px', fontWeight: 700 }}>{item.date}</span>
                        <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: item.date === selectedDay ? '#fff' : '#f59e0b',
                            marginTop: '4px',
                            opacity: item.date === selectedDay ? 1 : (item.date === 12 || item.date === 15 ? 1 : 0)
                        }} />
                    </div>
                ))}
            </div>

            {/* Due Tomorrow / Soon Section (Unpaid Only) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#888' }}>VENCE AMANHÃ</span>
                <span style={{ fontSize: '10px', color: '#f59e0b', backgroundColor: '#f59e0b20', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Ação Necessária</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {bills.filter((b: any) => b.dueSoon && !isPaidThisMonth(b)).map(renderBillCard)}
                {bills.filter((b: any) => b.dueSoon && !isPaidThisMonth(b)).length === 0 && (
                    <div style={{ color: '#666', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nenhuma conta urgente!</div>
                )}
            </div>

            {/* Upcoming Section (Unpaid Only) */}
            <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#888' }}>EM 3 DIAS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {bills.filter((b: any) => !b.dueSoon && !isPaidThisMonth(b)).map(renderBillCard)}
                {bills.filter((b: any) => !b.dueSoon && !isPaidThisMonth(b)).length === 0 && (
                    <div style={{ color: '#666', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Tudo em dia por aqui.</div>
                )}
            </div>

            {/* Already Paid Section (Paid Only) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#888' }}>JÁ PAGO</span>
                <CheckCircle size={16} color="#4b5563" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {bills.filter((b: any) => isPaidThisMonth(b)).map(renderBillCard)}
            </div>


            {/* Floating Summary Bar */}
            <div style={{
                position: 'fixed',
                bottom: '88px', // Above navigation
                left: '24px',
                right: '24px',
                maxWidth: '432px', // Match max-width - margin
                margin: '0 auto',
                backgroundColor: '#00d09c',
                borderRadius: '20px',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 20px rgba(0, 208, 156, 0.3)',
                zIndex: 50
            }}>
                <span style={{ color: '#053d2e', fontWeight: 700, fontSize: '12px' }}>TOTAL A VENCER NA SEMANA</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>
                    R$ {bills.filter((b: any) => !isPaidThisMonth(b)).reduce((acc: number, curr: any) => acc + curr.amount, 0).toFixed(2).replace('.', ',')}
                </span>
            </div>

        </div>
    );
}
