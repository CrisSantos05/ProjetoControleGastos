import { useState } from 'react';
import { ChevronLeft, Bell, Calendar, Activity, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
    const [tab, setTab] = useState('Histórico');
    const [toggles, setToggles] = useState({
        budgetLimits: true,
        weeklySummaries: true,
        billReminders: false,
        dailyPrompt: true,
    });

    const toggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/" style={{ color: '#fff' }}>
                    <ChevronLeft size={24} />
                </Link>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Notificações e Alertas</span>
                <Check size={20} color="#00d09c" />
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid #333' }}>
                {['Histórico', 'Configurações'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            paddingBottom: '12px',
                            borderBottom: tab === t ? '2px solid #00d09c' : 'none',
                            color: tab === t ? '#fff' : '#666',
                            fontWeight: 600,
                            flex: 1
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '12px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>ATIVIDADE RECENTE</h3>

                <div style={{ backgroundColor: '#1E1E1E', borderRadius: '20px', padding: '16px', marginBottom: '12px', display: 'flex', gap: '16px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#f59e0b20', borderRadius: '12px', height: 'max-content' }}>
                        <Activity size={20} color="#f59e0b" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>Alerta de Orçamento</span>
                            <span style={{ fontSize: '10px', color: '#666' }}>HÁ 24 MIN</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.4' }}>
                            Você atingiu <span style={{ color: '#f59e0b' }}>85%</span> do seu orçamento de Alimentação para este mês.
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#1E1E1E', borderRadius: '20px', padding: '16px', marginBottom: '12px', display: 'flex', gap: '16px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#00d09c20', borderRadius: '12px', height: 'max-content' }}>
                        <Bell size={20} color="#00d09c" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>Lembrete Diário</span>
                            <span style={{ fontSize: '10px', color: '#666' }}>HÁ 5H</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.4' }}>
                            Não esqueça de lançar seu café da manhã de hoje!
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#1E1E1E', borderRadius: '20px', padding: '16px', marginBottom: '12px', display: 'flex', gap: '16px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#3b82f620', borderRadius: '12px', height: 'max-content' }}>
                        <Calendar size={20} color="#3b82f6" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>Resumo Semanal</span>
                            <span style={{ fontSize: '10px', color: '#666' }}>ONTEM</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.4' }}>
                            Ótimo trabalho! Você gastou <span style={{ color: '#00d09c' }}>10% menos</span> que na semana passada.
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 style={{ fontSize: '12px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>PREFERÊNCIAS</h3>

                {[{ k: 'budgetLimits', l: 'Limites de Orçamento', d: 'Notificar ao aproximar dos limites' },
                { k: 'weeklySummaries', l: 'Resumos Semanais', d: 'Relatórios todo domingo de manhã' },
                { k: 'billReminders', l: 'Lembretes de Contas', d: 'Alertas para pagamentos recorrentes' },
                { k: 'dailyPrompt', l: 'Lembrete Diário', d: 'Lembrete noturno para lançar despesas' }
                ].map((item) => (
                    <div key={item.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '8px', backgroundColor: '#2A2A2A', borderRadius: '10px' }}>
                                <Bell size={16} color="#888" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{item.l}</div>
                                <div style={{ fontSize: '11px', color: '#666' }}>{item.d}</div>
                            </div>
                        </div>
                        <div
                            onClick={() => toggle(item.k as keyof typeof toggles)}
                            style={{
                                width: '44px',
                                height: '24px',
                                backgroundColor: toggles[item.k as keyof typeof toggles] ? '#00d09c' : '#333',
                                borderRadius: '12px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '2px',
                                left: toggles[item.k as keyof typeof toggles] ? '22px' : '2px',
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#fff',
                                borderRadius: '50%',
                                transition: 'all 0.2s'
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
