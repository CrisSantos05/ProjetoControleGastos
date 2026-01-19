import { useState } from 'react';
import { Calendar, Zap, Wifi, Home, CheckCircle, Plus, Truck, User } from 'lucide-react';

export default function BillReminders() {
    const now = new Date();
    const currentDay = now.getDate();
    const [selectedDay, setSelectedDay] = useState(currentDay);

    const getDaysForStrip = () => {
        const result = [];
        const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

        // Start from Monday of the current week (or similar logic)
        // For simplicity, let's just show 5 days starting from today or around today
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

    const bills = [
        {
            id: 1,
            name: 'Condomínio',
            type: 'Habitação • Mensal',
            amount: 450.00, // Estimated
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
            amount: 142.50, // Estimated
            dueText: 'VENCE DIA 18',
            icon: Zap,
            color: '#eab308',
            dueSoon: false
        },
        {
            id: 4,
            name: 'Teleson Internet',
            type: 'Serviço • Mensal',
            amount: 89.90, // Estimated
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

            {/* Due Tomorrow Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#888' }}>VENCE AMANHÃ</span>
                <span style={{ fontSize: '10px', color: '#f59e0b', backgroundColor: '#f59e0b20', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Ação Necessária</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {bills.filter(b => b.dueSoon).map(bill => (
                    <div key={bill.id} style={{ backgroundColor: '#1E1E1E', borderRadius: '24px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '16px',
                                    backgroundColor: '#162e2e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <bill.icon size={24} color="#00d09c" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{bill.name}</div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{bill.type}</div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '16px' }}>R$ {bill.amount.toFixed(2).replace('.', ',')}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>
                                <span style={{ fontSize: '14px' }}>⏰</span>
                                {bill.dueText}
                            </div>
                            <button style={{
                                backgroundColor: '#00d09c',
                                color: '#053d2e',
                                fontWeight: 700,
                                fontSize: '12px',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer'
                            }}>
                                Marcar como Pago
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* In 3 Days Section */}
            <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#888' }}>EM 3 DIAS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {bills.filter(b => !b.dueSoon).map(bill => (
                    <div key={bill.id} style={{ backgroundColor: '#1E1E1E', borderRadius: '24px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '16px',
                                    backgroundColor: '#2A2A2A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <bill.icon size={24} color="#888" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{bill.name}</div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{bill.type}</div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '16px' }}>R$ {bill.amount.toFixed(2).replace('.', ',')}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '11px', fontWeight: 600 }}>
                                <span style={{ fontSize: '14px' }}>📅</span>
                                {bill.dueText}
                            </div>
                            <button style={{
                                backgroundColor: '#2A2A2A',
                                color: '#888',
                                fontWeight: 600,
                                fontSize: '12px',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer'
                            }}>
                                Marcar como Pago
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Already Paid Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#888' }}>JÁ PAGO</span>
                <CheckCircle size={16} color="#4b5563" />
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
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>R$ 2.332,49</span>
            </div>

        </div>
    );
}
