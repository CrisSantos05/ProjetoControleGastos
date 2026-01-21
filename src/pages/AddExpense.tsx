import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, X, Camera, Zap, Wifi, User, PawPrint, CreditCard, Landmark, Calendar, Smartphone, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
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

export default function AddExpense() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('0');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [photoName, setPhotoName] = useState<string>('');
    const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [dueDate, setDueDate] = useState<string>(getLocalDate());
    const [isFixed, setIsFixed] = useState(false);
    const [installments, setInstallments] = useState('1');
    const [loading, setLoading] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#00d09c');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editCategoryColor, setEditCategoryColor] = useState('');
    const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            if (error) throw error;
            if (data) {
                setCategories(data);
                if (data.length > 0 && !selectedCategory) {
                    setSelectedCategory(data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAddCategory = async () => {
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) {
            alert('Por favor, informe um nome para a categoria.');
            return;
        }

        try {
            setLoading(true);

            // Check for duplicate names (case insensitive)
            const isDuplicate = categories.some(
                cat => cat.name.toLowerCase() === trimmedName.toLowerCase()
            );

            if (isDuplicate) {
                alert('Uma categoria com este nome já existe.');
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || '47561d55-42e9-46b5-8abe-e912bbd102aa';

            const { data, error } = await supabase
                .from('categories')
                .insert({
                    name: trimmedName,
                    icon: 'PlusCircle',
                    color: newCategoryColor,
                    user_id: userId
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase error adding category:', error);
                alert('Erro ao adicionar categoria: ' + error.message);
                return;
            }

            if (data) {
                setCategories(prev => [...prev, data]);
                setSelectedCategory(data.id);
                setShowNewCategoryModal(false);
                setNewCategoryName('');
            }
        } catch (error) {
            console.error('Catch error adding category:', error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                alert('Erro de conexão: Verifique sua internet ou as credenciais do Supabase.');
            } else {
                alert('Falha ao processar categoria: ' + (error as any).message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory) return;
        const trimmedName = editCategoryName.trim();
        if (!trimmedName) {
            alert('Por favor, informe um nome para a categoria.');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('categories')
                .update({
                    name: trimmedName,
                    color: editCategoryColor
                })
                .eq('id', editingCategory.id);

            if (error) throw error;

            setCategories(prev => prev.map(cat =>
                cat.id === editingCategory.id
                    ? { ...cat, name: trimmedName, color: editCategoryColor }
                    : cat
            ));
            setShowEditCategoryModal(false);
            setEditingCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Erro ao atualizar categoria: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria? Os gastos vinculados a ela poderão ser afetados.')) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) {
                if (error.code === '23503') {
                    alert('Não é possível excluir esta categoria pois existem gastos vinculados a ela. Exclua os gastos primeiro.');
                } else {
                    throw error;
                }
                return;
            }

            setCategories(prev => prev.filter(cat => cat.id !== id));
            if (selectedCategory === id) {
                setSelectedCategory(categories.find(c => c.id !== id)?.id || '');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Erro ao excluir categoria: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

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
        if (!selectedCategory) {
            alert('Selecione uma categoria');
            return;
        }

        try {
            setLoading(true);
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id || '47561d55-42e9-46b5-8abe-e912bbd102aa';

            const numInstallments = parseInt(installments) || 1;

            // If it has multiple installments, we create multiple records
            // If it's fixed, we create one with is_fixed = true
            const baseExpense = {
                user_id: userId,
                category_id: selectedCategory,
                amount: floatAmount,
                due_date: dueDate,
                is_fixed: isFixed,
                total_installments: isFixed ? 1 : numInstallments,
                paid: false
            };

            if (isFixed || numInstallments === 1) {
                const { error } = await supabase
                    .from('expenses')
                    .insert([baseExpense]);
                if (error) throw error;
            } else {
                // Create multiple records for installments
                const installmentsToInsert = [];
                const startDueDate = new Date(dueDate);

                for (let i = 1; i <= numInstallments; i++) {
                    const currentDueDate = new Date(startDueDate);
                    currentDueDate.setMonth(startDueDate.getMonth() + (i - 1));

                    installmentsToInsert.push({
                        ...baseExpense,
                        due_date: currentDueDate.toISOString().split('T')[0],
                        current_installment: i
                    });
                }

                const { error } = await supabase
                    .from('expenses')
                    .insert(installmentsToInsert);
                if (error) throw error;
            }

            navigate('/');
        } catch (error) {
            console.error('Error saving expense:', error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                alert('Erro de conexão: Verifique sua conexão ou credenciais.');
            } else {
                alert('Erro ao salvar despesa: ' + (error as any).message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Link to="/" style={{ color: '#1F2937' }}>
                    <ChevronLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>Nova Despesa</h1>
                <div style={{ width: '24px' }} />
            </div>

            {/* Amount Display */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '48px', fontWeight: 700, display: 'flex', alignItems: 'flex-start', color: '#1F2937' }}>
                    <span style={{ fontSize: '24px', marginTop: '8px', color: '#6B7280', marginRight: '4px' }}>R$</span>
                    {amount}
                </div>
            </div>

            {/* Category Selection */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#1F2937' }}>Categoria</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setShowManageCategoriesModal(true)}
                            style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <Zap size={14} /> Gerenciar
                        </button>
                        <button
                            onClick={() => setShowNewCategoryModal(true)}
                            style={{ color: '#00d09c', fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <Plus size={14} /> Adicionar
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {categories.map((cat) => {
                        const Icon = iconMap[cat.icon] || CreditCard;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px',
                                    borderRadius: '16px',
                                    backgroundColor: selectedCategory === cat.id ? cat.color : '#F3F4F6',
                                    color: selectedCategory === cat.id ? '#fff' : '#6B7280',
                                    minWidth: '90px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minHeight: '85px',
                                    justifyContent: 'center'
                                }}
                            >
                                <Icon size={24} />
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.2'
                                }}>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Options: Date, Fixed, Installments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                    <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>DATA DE VENCIMENTO</div>
                    <button
                        onClick={() => setShowCalendar(true)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            color: '#1F2937',
                            fontSize: '14px',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        {(() => {
                            const [year, month, day] = dueDate.split('-').map(Number);
                            return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
                        })()}
                        <Calendar size={18} color="#6B7280" />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>PARCELA FIXA?</div>
                        <button
                            onClick={() => setIsFixed(!isFixed)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: isFixed ? '#00d09c20' : '#F3F4F6',
                                border: isFixed ? '1px solid #00d09c' : '1px solid #E5E7EB',
                                borderRadius: '12px',
                                color: isFixed ? '#00d09c' : '#1F2937',
                                fontSize: '14px',
                                fontWeight: 600
                            }}
                        >
                            {isFixed ? 'SIM' : 'NÃO'}
                        </button>
                    </div>
                    {!isFixed && (
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>PARCELAS</div>
                            <input
                                type="number"
                                min="1"
                                value={installments}
                                onChange={(e) => setInstallments(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: '#F3F4F6',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '12px',
                                    color: '#1F2937',
                                    fontSize: '14px',
                                    outline: 'none',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Keyboard */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                width: '100%',
                marginBottom: '24px'
            }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, 'back'].map((key) => (
                    <button
                        key={key}
                        onClick={() => handleKeyPress(key.toString())}
                        style={{
                            height: '56px',
                            fontSize: '20px',
                            fontWeight: 600,
                            color: key === 'back' ? '#ef4444' : '#1F2937',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {key === 'back' ? <ChevronLeft /> : key}
                    </button>
                ))}
            </div>

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
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {loading ? 'Salvando...' : 'Registrar Gasto'}
            </button>

            {/* Calendar Modal */}
            {showCalendar && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h2 style={{ fontWeight: 700 }}>Selecionar Data</h2>
                            <button onClick={() => setShowCalendar(false)} style={{ border: 'none', background: 'none' }}><X size={24} /></button>
                        </div>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => { setDueDate(e.target.value); setShowCalendar(false); }}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                fontSize: '16px',
                                boxSizing: 'border-box',
                                display: 'block'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* New Category Modal */}
            {showNewCategoryModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ fontWeight: 700 }}>Nova Categoria</h2>
                            <button onClick={() => setShowNewCategoryModal(false)} style={{ border: 'none', background: 'none' }}><X size={24} /></button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', display: 'block' }}>NOME DA CATEGORIA</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ex: Aluguel"
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', display: 'block' }}>COR</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['#00d09c', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewCategoryColor(color)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: color,
                                            border: newCategoryColor === color ? '3px solid #000' : 'none',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleAddCategory}
                            style={{ width: '100%', padding: '16px', backgroundColor: '#00d09c', color: '#000', fontWeight: 700, borderRadius: '16px', border: 'none', cursor: 'pointer' }}
                        >
                            Criar Categoria
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditCategoryModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ fontWeight: 700 }}>Editar Categoria</h2>
                            <button onClick={() => setShowEditCategoryModal(false)} style={{ border: 'none', background: 'none' }}><X size={24} /></button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', display: 'block' }}>NOME DA CATEGORIA</label>
                            <input
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                placeholder="Ex: Aluguel"
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', display: 'block' }}>COR</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['#00d09c', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setEditCategoryColor(color)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: color,
                                            border: editCategoryColor === color ? '3px solid #000' : 'none',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleUpdateCategory}
                            style={{ width: '100%', padding: '16px', backgroundColor: '#00d09c', color: '#000', fontWeight: 700, borderRadius: '16px', border: 'none', cursor: 'pointer' }}
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            )}

            {/* Manage Categories Modal */}
            {showManageCategoriesModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                            <h2 style={{ fontWeight: 700 }}>Gerenciar Categorias</h2>
                            <button onClick={() => setShowManageCategoriesModal(false)} style={{ border: 'none', background: 'none' }}><X size={24} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {categories.map((cat) => (
                                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: cat.color }} />
                                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => {
                                                setEditingCategory(cat);
                                                setEditCategoryName(cat.name);
                                                setEditCategoryColor(cat.color);
                                                setShowEditCategoryModal(true);
                                            }}
                                            style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

