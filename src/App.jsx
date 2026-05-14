import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  Modal,
  NumberInput,
  Paper,
  Progress,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useComputedColorScheme,
  useMantineColorScheme
} from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import {
  IconArrowsExchange,
  IconChevronLeft,
  IconChevronRight,
  IconCreditCard,
  IconDeviceFloppy,
  IconHistory,
  IconHome,
  IconMoonStars,
  IconPigMoney,
  IconPlus,
  IconReceipt2,
  IconSelector,
  IconShoppingBag,
  IconSun,
  IconTarget,
  IconTrash,
  IconWallet
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LeadingActions,
  SwipeAction,
  SwipeableList,
  SwipeableListItem,
  TrailingActions,
  Type
} from 'react-swipeable-list';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const SHORT_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Inversiones', 'Negocio', 'Otros ingresos'];
const EXPENSE_CATEGORIES = ['Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Ropa', 'Alquiler', 'Educación', 'Deudas', 'Ahorro', 'Otros'];
const METHODS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'SINPE', 'Domiciliación'];

const DEFAULT_DATA = {
  tx: [
    { id: 1, dt: '2026-05-01', tp: 'in', cat: 'Salario', desc: 'Salario mayo', amt: 850000, met: 'Transferencia', cardId: null },
    { id: 2, dt: '2026-05-03', tp: 'out', cat: 'Alimentación', desc: 'Super semanal', amt: 45000, met: 'Débito', cardId: null },
    { id: 3, dt: '2026-05-04', tp: 'out', cat: 'Transporte', desc: 'Gasolina', amt: 28000, met: 'Débito', cardId: null },
    { id: 4, dt: '2026-05-05', tp: 'out', cat: 'Servicios', desc: 'Luz + Internet', amt: 40000, met: 'Domiciliación', cardId: null },
    { id: 5, dt: '2026-05-08', tp: 'out', cat: 'Entretenimiento', desc: 'Spotify', amt: 4234, met: 'Crédito', cardId: 'card-bac' },
    { id: 6, dt: '2026-04-15', tp: 'out', cat: 'Entretenimiento', desc: 'GITHUB, INC.', amt: 20296, met: 'Crédito', cardId: 'card-bac' },
    { id: 7, dt: '2026-03-31', tp: 'out', cat: 'Transporte', desc: 'ECONOMY CAR RENTALS', amt: 215587, met: 'Crédito', cardId: 'card-bac' },
    { id: 8, dt: '2026-03-30', tp: 'in', cat: 'Otros ingresos', desc: 'PIN-SINPE recibido', amt: 110000, met: 'SINPE', cardId: null }
  ],
  budgets: { Alimentación: 150000, Transporte: 60000, Entretenimiento: 30000, Salud: 25000, Ropa: 20000 },
  cards: [
    { id: 'card-bac', nm: 'BAC Cashback', limit: 1800000, balance: 486320, min: 42000, closing: 27, due: 12, last4: '4488' }
  ],
  savings: [
    { id: 1, nm: 'Fondo emergencia', target: 1500000, current: 480000, due: '2026-12-31', monthly: 85000 },
    { id: 2, nm: 'Viaje Panamá', target: 420000, current: 160000, due: '2026-09-15', monthly: 65000 }
  ],
  shopping: [
    { id: 1, nm: 'Super semanal', cat: 'Alimentación', price: 42000, freq: 'Semanal', last: '2026-05-12' },
    { id: 2, nm: 'Spotify', cat: 'Entretenimiento', price: 4234, freq: 'Mensual', last: '2026-05-08' },
    { id: 3, nm: 'Farmacia básica', cat: 'Salud', price: 14000, freq: 'Mensual', last: '2026-05-07' }
  ],
  fixed: [
    { id: 1, nm: 'Alquiler', amt: 250000, day: 1, cat: 'Alquiler' },
    { id: 2, nm: 'Internet', amt: 22000, day: 10, cat: 'Servicios' }
  ],
  extras: [
    { id: 1, nm: 'Imprevistos carro', amt: 35000, cat: 'Transporte' },
    { id: 2, nm: 'Regalo familiar', amt: 25000, cat: 'Otros' }
  ],
  platforms: [
    { id: 1, nm: 'Netflix', amt: 6990, due: 12 },
    { id: 2, nm: 'Spotify', amt: 4234, due: 8 },
    { id: 3, nm: 'GitHub', amt: 20296, due: 15 }
  ]
};

const fmt = value => `₡${Math.abs(Number(value || 0)).toLocaleString('es-CR', { maximumFractionDigits: 0 })}`;
const newId = () => Date.now() + Math.floor(Math.random() * 1000);

function monthFilter(list, year, month) {
  return list.filter(item => {
    const date = new Date(`${item.dt}T12:00:00`);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

function SectionHeader({ label, title, action }) {
  return (
    <Group justify="space-between" align="end">
      <Box>
        <Text size="xs" fw={800} c="blue" tt="uppercase">{label}</Text>
        <Title order={3}>{title}</Title>
      </Box>
      {action}
    </Group>
  );
}

function StatCard({ label, value, sub, icon, color, onClick }) {
  const Icon = icon;
  return (
    <Card radius="xl" withBorder p="lg" onClick={onClick} style={{ background: 'light-dark(rgba(255,255,255,.72), rgba(8,12,20,.92))', backdropFilter: 'blur(18px)', cursor: onClick ? 'pointer' : 'default' }}>
      <Group justify="space-between" mb="xs">
        <Text size="xs" fw={800} c="dimmed" tt="uppercase">{label}</Text>
        <ThemeIcon variant="light" color={color} radius="md"><Icon size={16} /></ThemeIcon>
      </Group>
      <Text fw={800} fz={28} className="mono" c={color}>{value}</Text>
      <Text size="sm" c="dimmed" mt={6}>{sub}</Text>
    </Card>
  );
}

function SwipeRow({ children, onDelete }) {
  const leadingActions = (
    <LeadingActions>
      <SwipeAction onClick={onDelete} destructive>
        <Box className="swipe-delete swipe-delete--leading">
          <IconTrash size={18} />
        </Box>
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = (
    <TrailingActions>
      <SwipeAction onClick={onDelete} destructive>
        <Box className="swipe-delete">
          <IconTrash size={18} />
        </Box>
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <SwipeableList type={Type.IOS} fullSwipe>
      <SwipeableListItem leadingActions={leadingActions} trailingActions={trailingActions}>
        <Box className="swipe-card">{children}</Box>
      </SwipeableListItem>
    </SwipeableList>
  );
}

function PickerField({ label, value, placeholder, options, onChange }) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Button
        variant="subtle"
        justify="space-between"
        rightSection={<IconSelector size={16} />}
        onClick={() => setOpened(true)}
        styles={{
          root: {
            width: '100%',
            height: 58,
            borderRadius: 16,
            border: '1px solid var(--mantine-color-dark-4)',
            background: 'rgba(255,255,255,.03)',
            paddingInline: 16
          },
          inner: { justifyContent: 'space-between', width: '100%' },
          label: { width: '100%', textAlign: 'left', fontWeight: 500 }
        }}
      >
        <Box ta="left">
          <Text size="xs" c="dimmed" fw={700} mb={4}>{label}</Text>
          <Text>{value || placeholder}</Text>
        </Box>
      </Button>
      <Modal opened={opened} onClose={() => setOpened(false)} title={label} centered radius="xl">
        <Stack gap="xs">
          {options.map(option => {
            const item = typeof option === 'string' ? { value: option, label: option } : option;
            return (
              <Button
                key={item.value}
                variant={item.value === value ? 'light' : 'subtle'}
                justify="flex-start"
                onClick={() => {
                  onChange(item.value);
                  setOpened(false);
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Modal>
    </>
  );
}

function TransactionDrawer({ opened, onClose, value, onSave, onDelete, cards }) {
  const [form, setForm] = useState(value);

  React.useEffect(() => {
    setForm(value);
  }, [value]);

  return (
    <Drawer opened={opened} onClose={onClose} position="bottom" size="78%" radius="xl" title={<Title order={3}>{form.id ? 'Editar movimiento' : 'Nuevo movimiento'}</Title>} styles={{ body: { paddingBottom: 110 } }}>
      <Stack pb={90}>
        <SegmentedControl fullWidth value={form.tp} onChange={tp => setForm(current => ({ ...current, tp, cat: tp === 'in' ? 'Salario' : 'Alimentación' }))} data={[{ label: 'Gasto', value: 'out' }, { label: 'Ingreso', value: 'in' }]} />
        <TextInput type="date" label="Fecha" value={form.dt} onChange={event => setForm(current => ({ ...current, dt: event.currentTarget.value }))} />
        <PickerField label="Categoría" placeholder="Selecciona categoría" options={(form.tp === 'in' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(item => ({ value: item, label: item }))} value={form.cat} onChange={cat => setForm(current => ({ ...current, cat }))} />
        <TextInput label="Descripción" value={form.desc} onChange={event => setForm(current => ({ ...current, desc: event.currentTarget.value }))} />
        <NumberInput label="Monto" hideControls thousandSeparator="," value={form.amt} onChange={amt => setForm(current => ({ ...current, amt: Number(amt) || 0 }))} />
        <PickerField label="Método" placeholder="Selecciona método" options={METHODS.map(item => ({ value: item, label: item }))} value={form.met} onChange={met => setForm(current => ({ ...current, met, cardId: met === 'Crédito' ? current.cardId : null }))} />
        {form.met === 'Crédito' && (
          <PickerField label="Tarjeta" placeholder="Selecciona tarjeta" options={cards.map(card => ({ value: card.id, label: card.nm }))} value={form.cardId} onChange={cardId => setForm(current => ({ ...current, cardId }))} />
        )}
      </Stack>
      <Paper pos="absolute" left={0} right={0} bottom={0} p="md" withBorder bg="var(--mantine-color-body)">
        <Group grow>
          {form.id && <Button variant="light" color="red" leftSection={<IconTrash size={16} />} onClick={() => onDelete(form.id)}>Eliminar</Button>}
          <Button leftSection={<IconDeviceFloppy size={16} />} onClick={() => onSave(form)}>Guardar</Button>
        </Group>
      </Paper>
    </Drawer>
  );
}

export default function App() {
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('dark');
  const [data, setData] = useLocalStorage({ key: 'finanzas-v7', defaultValue: DEFAULT_DATA });
  const [tab, setTab] = useState('home');
  const [drawerOpened, drawerHandlers] = useDisclosure(false);
  const [budgetModalOpened, budgetModalHandlers] = useDisclosure(false);
  const [cardModalOpened, cardModalHandlers] = useDisclosure(false);
  const [savingModalOpened, savingModalHandlers] = useDisclosure(false);
  const [draft, setDraft] = useState({ id: null, dt: new Date().toISOString().slice(0, 10), tp: 'out', cat: 'Alimentación', desc: '', amt: 0, met: 'Débito', cardId: null });
  const [budgetDraft, setBudgetDraft] = useState({ category: 'Alimentación', amount: 0 });
  const [cardDraft, setCardDraft] = useState({ nm: '', limit: 0, balance: 0, closing: 25, due: 10, last4: '' });
  const [savingDraft, setSavingDraft] = useState({ nm: '', target: 0, current: 0, due: '', monthly: 0 });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const monthTx = useMemo(() => monthFilter(data.tx, currentMonth.year, currentMonth.month), [data.tx, currentMonth]);
  const income = monthTx.filter(item => item.tp === 'in').reduce((sum, item) => sum + item.amt, 0);
  const expenses = monthTx.filter(item => item.tp === 'out').reduce((sum, item) => sum + item.amt, 0);
  const balance = income - expenses;
  const savingsTotal = data.savings.reduce((sum, item) => sum + item.current, 0);
  const generalBalance = data.tx.reduce((sum, item) => sum + (item.tp === 'in' ? item.amt : -item.amt), 0);

  const trend = useMemo(() => {
    return Array.from({ length: 6 }).map((_, index) => {
      const offset = 5 - index;
      const month = (currentMonth.month - offset + 12) % 12;
      const year = currentMonth.year - (currentMonth.month - offset < 0 ? 1 : 0);
      const slice = monthFilter(data.tx, year, month);
      return {
        mes: SHORT_MONTHS[month],
        Ingresos: slice.filter(item => item.tp === 'in').reduce((sum, item) => sum + item.amt, 0),
        Gastos: slice.filter(item => item.tp === 'out').reduce((sum, item) => sum + item.amt, 0)
      };
    });
  }, [data.tx, currentMonth]);

  const groupedHistory = useMemo(() => {
    const groups = {};
    data.tx.forEach(item => {
      const key = item.dt.slice(0, 7);
      groups[key] = groups[key] || [];
      groups[key].push(item);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [data.tx]);

  const openNewTransaction = transaction => {
    setDraft(transaction || { id: null, dt: new Date().toISOString().slice(0, 10), tp: 'out', cat: 'Alimentación', desc: '', amt: 0, met: 'Débito', cardId: null });
    drawerHandlers.open();
  };

  const saveTransaction = transaction => {
    setData(current => {
      if (transaction.id) {
        return { ...current, tx: current.tx.map(item => item.id === transaction.id ? transaction : item) };
      }
      return { ...current, tx: [...current.tx, { ...transaction, id: newId() }] };
    });
    drawerHandlers.close();
  };

  const removeTransaction = id => {
    setData(current => ({ ...current, tx: current.tx.filter(item => item.id !== id) }));
    drawerHandlers.close();
  };

  const removeCard = id => {
    setData(current => ({
      ...current,
      cards: current.cards.filter(card => card.id !== id),
      tx: current.tx.map(item => item.cardId === id ? { ...item, cardId: null } : item)
    }));
  };

  const removeBudget = category => {
    setData(current => {
      const budgets = { ...current.budgets };
      delete budgets[category];
      return { ...current, budgets };
    });
  };

  const removeSaving = id => {
    setData(current => ({ ...current, savings: current.savings.filter(goal => goal.id !== id) }));
  };

  const removeShopping = id => {
    setData(current => ({ ...current, shopping: current.shopping.filter(item => item.id !== id) }));
  };

  const saveBudget = () => {
    if (!budgetDraft.category || !budgetDraft.amount) {
      return;
    }
    setData(current => ({
      ...current,
      budgets: {
        ...current.budgets,
        [budgetDraft.category]: Number(budgetDraft.amount)
      }
    }));
    budgetModalHandlers.close();
  };

  const saveCard = () => {
    if (!cardDraft.nm || !cardDraft.limit) {
      return;
    }
    setData(current => ({
      ...current,
      cards: [...current.cards, { id: newId(), ...cardDraft }]
    }));
    setCardDraft({ nm: '', limit: 0, balance: 0, closing: 25, due: 10, last4: '' });
    cardModalHandlers.close();
  };

  const saveSaving = () => {
    if (!savingDraft.nm || !savingDraft.target) {
      return;
    }
    setData(current => ({
      ...current,
      savings: [...current.savings, { id: newId(), ...savingDraft }]
    }));
    setSavingDraft({ nm: '', target: 0, current: 0, due: '', monthly: 0 });
    savingModalHandlers.close();
  };

  const buyShoppingItem = item => {
    const tx = { id: newId(), dt: new Date().toISOString().slice(0, 10), tp: 'out', cat: item.cat, desc: item.nm, amt: item.price, met: 'Débito', cardId: null };
    setData(current => ({
      ...current,
      tx: [...current.tx, tx],
      shopping: current.shopping.map(entry => entry.id === item.id ? { ...entry, last: tx.dt } : entry)
    }));
    setTab('tx');
    openNewTransaction(tx);
  };

  const topCategory = useMemo(() => {
    const totals = {};
    monthTx.filter(item => item.tp === 'out').forEach(item => {
      totals[item.cat] = (totals[item.cat] || 0) + item.amt;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  }, [monthTx]);

  const expenseBreakdown = useMemo(() => {
    const totals = {};
    monthTx.filter(item => item.tp === 'out').forEach(item => {
      totals[item.cat] = (totals[item.cat] || 0) + item.amt;
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [monthTx]);

  const navItems = [
    { key: 'home', label: 'Inicio', icon: IconHome },
    { key: 'tx', label: 'Movs', icon: IconArrowsExchange },
    { key: 'cards', label: 'Tarjetas', icon: IconCreditCard },
    { key: 'budgets', label: 'Presu', icon: IconTarget },
    { key: 'savings', label: 'Ahorro', icon: IconPigMoney },
    { key: 'shopping', label: 'Compras', icon: IconShoppingBag },
    { key: 'hist', label: 'Hist', icon: IconHistory }
  ];

  const predictionCards = [
    {
      label: 'Ingreso promedio',
      value: fmt(trend.reduce((sum, item) => sum + item.Ingresos, 0) / Math.max(trend.length, 1)),
      sub: 'Basado en 6 meses',
      color: 'green'
    },
    {
      label: 'Gasto promedio',
      value: fmt(trend.reduce((sum, item) => sum + item.Gastos, 0) / Math.max(trend.length, 1)),
      sub: 'Ritmo esperado',
      color: 'red'
    },
    {
      label: 'Ahorro potencial',
      value: fmt((trend.reduce((sum, item) => sum + item.Ingresos, 0) - trend.reduce((sum, item) => sum + item.Gastos, 0)) / Math.max(trend.length, 1)),
      sub: 'Mensual estimado',
      color: 'blue'
    }
  ];

  const renderHistoryList = () => (
    <Stack gap="md">
      {groupedHistory.map(([key, items]) => (
        <Stack key={key} gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={700} c="dimmed">{MONTHS[Number(key.slice(5, 7)) - 1]} {key.slice(0, 4)}</Text>
            <Text size="sm" fw={700} className="mono">{fmt(items.reduce((sum, item) => sum + (item.tp === 'in' ? item.amt : -item.amt), 0))}</Text>
          </Group>
          {items.sort((a, b) => b.dt.localeCompare(a.dt)).map(item => (
            <SwipeRow key={item.id} onDelete={() => removeTransaction(item.id)}>
              <Card radius="xl" withBorder p="md" onClick={() => openNewTransaction(item)} style={{ cursor: 'pointer' }}>
                <Group justify="space-between" wrap="nowrap">
                  <Box>
                    <Text fw={800}>{item.desc}</Text>
                    <Text size="sm" c="dimmed">{item.cat} · {item.met} · {item.dt}</Text>
                  </Box>
                  <Text fw={800} className="mono" c={item.tp === 'in' ? 'green' : undefined}>{item.tp === 'in' ? '+' : '−'}{fmt(item.amt)}</Text>
                </Group>
              </Card>
            </SwipeRow>
          ))}
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Box className="app-shell grid-overlay" pb={120}>
      <Box maw={560} mx="auto" pt="md">
        <Paper m="md" p="lg" radius="28px" withBorder shadow="xl" style={{ backdropFilter: 'blur(18px)', background: 'light-dark(rgba(255,255,255,.74), rgba(10,15,23,.84))' }}>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={800} c="blue" tt="uppercase">Mi Finanzas</Text>
              <Title order={1}>Centro financiero</Title>
            </Box>
            <Switch size="lg" onLabel={<IconSun size={14} />} offLabel={<IconMoonStars size={14} />} checked={colorScheme === 'light'} onChange={event => setColorScheme(event.currentTarget.checked ? 'light' : 'dark')} />
          </Group>
        </Paper>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <Stack px="md" gap="md">
          {tab === 'home' && (
            <>
              <Paper p="md" radius="xl" withBorder>
                <Group justify="space-between">
                  <ActionIcon variant="light" size="lg" onClick={() => setCurrentMonth(current => ({ year: current.month === 0 ? current.year - 1 : current.year, month: current.month === 0 ? 11 : current.month - 1 }))}><IconChevronLeft size={18} /></ActionIcon>
                  <Box ta="center">
                    <Title order={3}>{MONTHS[currentMonth.month]}</Title>
                    <Text size="sm" c="dimmed">{currentMonth.year}</Text>
                  </Box>
                  <ActionIcon variant="light" size="lg" onClick={() => setCurrentMonth(current => ({ year: current.month === 11 ? current.year + 1 : current.year, month: current.month === 11 ? 0 : current.month + 1 }))}><IconChevronRight size={18} /></ActionIcon>
                </Group>
              </Paper>

              <Card radius="xl" withBorder p="lg" style={{ background: 'linear-gradient(180deg, rgba(7, 12, 20, 0.96), rgba(7, 10, 16, 0.88))' }}>
                <SectionHeader label="Resumen" title="Panorama general" action={<Badge color="blue" variant="light">{currentMonth.year}</Badge>} />
                <Box h={190} mt="sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,.18)" vertical={false} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={value => `₡${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={value => fmt(value)} />
                      <Line type="monotone" dataKey="Ingresos" stroke="#66e3a6" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="Gastos" stroke="#ff6b86" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <SimpleGrid cols={2} mt="md">
                  <Box>
                    <Text size="xs" c="dimmed" fw={800} tt="uppercase">Balance general</Text>
                    <Text className="mono" fw={800} fz={28} c={generalBalance >= 0 ? 'blue.4' : 'red.4'}>{fmt(generalBalance)}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed" fw={800} tt="uppercase">Mayor gasto</Text>
                    <Text fw={700}>{topCategory ? topCategory[0] : 'Sin datos'}</Text>
                    <Text size="sm" c="dimmed">{topCategory ? fmt(topCategory[1]) : 'Aún no hay egresos'}</Text>
                  </Box>
                </SimpleGrid>
                {expenseBreakdown.length > 0 && (
                  <Stack gap={8} mt="md">
                    {expenseBreakdown.map(([category, total]) => (
                      <Group key={category} justify="space-between">
                        <Text size="sm" c="dimmed">{category}</Text>
                        <Text size="sm" fw={700} className="mono">{fmt(total)}</Text>
                      </Group>
                    ))}
                  </Stack>
                )}
              </Card>

              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <StatCard label="Ingresos" value={fmt(income)} sub="Toca para ver movimientos" icon={IconWallet} color="green" onClick={() => setTab('tx')} />
                <StatCard label="Gastos" value={fmt(expenses)} sub={topCategory ? `Mayor fuga: ${topCategory[0]}` : 'Toca para ver presupuestos'} icon={IconReceipt2} color="red" onClick={() => setTab('budgets')} />
                <StatCard label="Balance" value={fmt(balance)} sub="Toca para abrir historial" icon={IconArrowsExchange} color={balance >= 0 ? 'blue' : 'red'} onClick={() => setTab('hist')} />
                <StatCard label="Ahorros" value={fmt(savingsTotal)} sub={`${data.savings.length} metas activas`} icon={IconPigMoney} color="teal" onClick={() => setTab('savings')} />
              </SimpleGrid>

              <Card radius="xl" withBorder p="lg" onClick={() => setTab('hist')} style={{ cursor: 'pointer' }}>
                <SectionHeader label="Radar" title="Tendencia 6 meses" />
                <Box h={220} mt="sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2dd881" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#2dd881" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff5f7a" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#ff5f7a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,.24)" vertical={false} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={value => `₡${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={value => fmt(value)} />
                      <Area type="monotone" dataKey="Ingresos" stroke="#2dd881" fill="url(#incomeFill)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Gastos" stroke="#ff5f7a" fill="url(#expenseFill)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </>
          )}

          {tab === 'tx' && (
            <>
              <SectionHeader label="Control" title="Movimientos" action={<ActionIcon size="xl" radius="xl" onClick={() => openNewTransaction()}><IconPlus size={20} /></ActionIcon>} />
              {renderHistoryList()}
            </>
          )}

          {tab === 'cards' && (
            <>
              <SectionHeader label="BAC" title="Tarjetas" action={<ActionIcon size="xl" radius="xl" onClick={() => cardModalHandlers.open()}><IconPlus size={20} /></ActionIcon>} />
              {data.cards.map(card => (
                <SwipeRow key={card.id} onDelete={() => removeCard(card.id)}>
                  <UniformCard style={{ background: 'linear-gradient(135deg, rgba(91,157,255,.18), transparent)' }}>
                    <Group justify="space-between" align="start">
                      <Box>
                        <Title order={3}>{card.nm}</Title>
                        <Text size="sm" c="dimmed">•••• {card.last4} · corte {card.closing} · pago {card.due}</Text>
                      </Box>
                      <Badge color="blue" variant="light">{Math.round((card.balance / card.limit) * 100)}%</Badge>
                    </Group>
                    <Group mt="lg" justify="space-between">
                      <Box>
                        <Text size="sm" c="dimmed">Saldo</Text>
                        <Text fz={28} fw={800} className="mono">{fmt(card.balance)}</Text>
                      </Box>
                      <Box ta="right">
                        <Text size="sm" c="dimmed">Límite</Text>
                        <Text fz={22} fw={800} className="mono">{fmt(card.limit)}</Text>
                      </Box>
                    </Group>
                    <Progress mt="md" size="lg" radius="xl" value={(card.balance / card.limit) * 100} color="blue" />
                  </UniformCard>
                </SwipeRow>
              ))}
            </>
          )}

          {tab === 'budgets' && (
            <>
              <SectionHeader label="Control" title="Presupuestos" action={<ActionIcon size="xl" radius="xl" onClick={() => budgetModalHandlers.open()}><IconPlus size={20} /></ActionIcon>} />
              {Object.entries(data.budgets).map(([category, budget]) => {
                const spent = monthTx.filter(item => item.tp === 'out' && item.cat === category).reduce((sum, item) => sum + item.amt, 0);
                return (
                  <SwipeRow key={category} onDelete={() => removeBudget(category)}>
                    <UniformCard onClick={() => setTab('tx')}>
                      <Group justify="space-between">
                        <Box>
                          <Text fw={800}>{category}</Text>
                          <Text size="sm" c="dimmed">{fmt(spent)} de {fmt(budget)}</Text>
                        </Box>
                        <Badge color={spent > budget ? 'red' : 'blue'}>{Math.round((spent / budget) * 100)}%</Badge>
                      </Group>
                      <Progress mt="md" size="lg" radius="xl" value={Math.min((spent / budget) * 100, 100)} color={spent > budget ? 'red' : 'blue'} />
                    </UniformCard>
                  </SwipeRow>
                );
              })}
            </>
          )}

          {tab === 'savings' && (
            <>
              <SectionHeader label="Sistema" title="Ahorros" action={<ActionIcon size="xl" radius="xl" onClick={() => savingModalHandlers.open()}><IconPlus size={20} /></ActionIcon>} />
              {data.savings.map(goal => (
                <SwipeRow key={goal.id} onDelete={() => removeSaving(goal.id)}>
                  <UniformCard>
                    <Group justify="space-between">
                      <Box>
                        <Text fw={800}>{goal.nm}</Text>
                        <Text size="sm" c="dimmed">Meta {fmt(goal.target)} · fecha {goal.due}</Text>
                      </Box>
                      <Text fw={800} className="mono">{fmt(goal.current)}</Text>
                    </Group>
                    <Progress mt="md" size="lg" radius="xl" color="teal" value={(goal.current / goal.target) * 100} />
                    <Text mt="sm" size="sm" c="dimmed">Aporte sugerido mensual: {fmt(goal.monthly)}</Text>
                  </UniformCard>
                </SwipeRow>
              ))}
            </>
          )}

          {tab === 'shopping' && (
            <>
              <SectionHeader label="Rutina" title="Compras frecuentes" />
              {data.shopping.map(item => (
                <SwipeRow key={item.id} onDelete={() => removeShopping(item.id)}>
                  <UniformCard>
                    <Group justify="space-between" align="start">
                      <Box>
                        <Text fw={800}>{item.nm}</Text>
                        <Text size="sm" c="dimmed">{item.cat} · {item.freq} · última {item.last}</Text>
                      </Box>
                      <Text fw={800} className="mono">{fmt(item.price)}</Text>
                    </Group>
                    <Button mt="md" variant="light" leftSection={<IconShoppingBag size={16} />} onClick={() => buyShoppingItem(item)}>Comprar ahora</Button>
                  </UniformCard>
                </SwipeRow>
              ))}
              <SectionHeader label="Servicios" title="Plataformas digitales" />
              {data.platforms.map(item => (
                <UniformCard key={item.id}>
                  <Group justify="space-between">
                    <Box>
                      <Text fw={800}>{item.nm}</Text>
                      <Text size="sm" c="dimmed">Cobro el día {item.due}</Text>
                    </Box>
                    <Text fw={800} className="mono">{fmt(item.amt)}</Text>
                  </Group>
                </UniformCard>
              ))}
              <SectionHeader label="Caja" title="Gastos extra" />
              {data.extras.map(item => (
                <UniformCard key={item.id}>
                  <Group justify="space-between">
                    <Box>
                      <Text fw={800}>{item.nm}</Text>
                      <Text size="sm" c="dimmed">{item.cat}</Text>
                    </Box>
                    <Text fw={800} className="mono">{fmt(item.amt)}</Text>
                  </Group>
                </UniformCard>
              ))}
              <SectionHeader label="Calendario" title="Pagos fijos" />
              {data.fixed.map(item => (
                <UniformCard key={item.id}>
                  <Group justify="space-between">
                    <Box>
                      <Text fw={800}>{item.nm}</Text>
                      <Text size="sm" c="dimmed">{item.cat} · día {item.day}</Text>
                    </Box>
                    <Text fw={800} className="mono">{fmt(item.amt)}</Text>
                  </Group>
                </UniformCard>
              ))}
            </>
          )}

          {tab === 'hist' && (
            <>
              <SectionHeader label="Predicción" title="Historial" />
              <Card radius="xl" withBorder p="lg">
                <Box h={220}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id="histIncomeFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2dd881" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#2dd881" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="histExpenseFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff5f7a" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#ff5f7a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,.24)" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={value => `₡${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={value => fmt(value)} />
                      <Area type="monotone" dataKey="Ingresos" stroke="#2dd881" fill="url(#histIncomeFill)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="Gastos" stroke="#ff5f7a" fill="url(#histExpenseFill)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
                <Text mt="md" size="sm" c="dimmed">Predicción rápida: si mantienes este ritmo, el gasto próximo mes ronda {fmt(trend.reduce((sum, item) => sum + item.Gastos, 0) / Math.max(trend.length, 1))}.</Text>
              </Card>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                {predictionCards.map(item => (
                  <Card key={item.label} radius="xl" withBorder>
                    <Text size="xs" fw={800} c="dimmed" tt="uppercase">{item.label}</Text>
                    <Text mt="xs" fw={800} fz={24} c={item.color} className="mono">{item.value}</Text>
                    <Text size="sm" c="dimmed" mt={4}>{item.sub}</Text>
                  </Card>
                ))}
              </SimpleGrid>
              <Divider label="Todos los movimientos" labelPosition="center" />
              {renderHistoryList()}
            </>
          )}
        </Stack>
          </motion.div>
        </AnimatePresence>

        <Paper pos="fixed" bottom={12} left="50%" style={{ transform: 'translateX(-50%)', width: 'min(96vw, 560px)', zIndex: 120, backdropFilter: 'blur(22px)' }} radius="24px" withBorder p="xs">
          <ScrollArea.Autosize mah={82} className="hide-scrollbar">
            <Group wrap="nowrap" gap="xs">
              {navItems.map(item => {
                const Icon = item.icon;
                return <Button key={item.key} variant={tab === item.key ? 'filled' : 'subtle'} radius="xl" leftSection={<Icon size={16} />} onClick={() => setTab(item.key)}>{item.label}</Button>;
              })}
            </Group>
          </ScrollArea.Autosize>
        </Paper>
      </Box>

      <TransactionDrawer opened={drawerOpened} onClose={drawerHandlers.close} value={draft} onSave={saveTransaction} onDelete={removeTransaction} cards={data.cards} />
      <Modal opened={budgetModalOpened} onClose={budgetModalHandlers.close} title="Nuevo presupuesto" centered radius="xl">
        <Stack>
          <PickerField
            label="Categoría"
            placeholder="Selecciona categoría"
            options={EXPENSE_CATEGORIES.map(item => ({ value: item, label: item }))}
            value={budgetDraft.category}
            onChange={category => setBudgetDraft(current => ({ ...current, category }))}
          />
          <NumberInput
            label="Monto mensual"
            hideControls
            thousandSeparator=","
            value={budgetDraft.amount}
            onChange={amount => setBudgetDraft(current => ({ ...current, amount: Number(amount) || 0 }))}
          />
          <Button onClick={saveBudget}>Guardar presupuesto</Button>
        </Stack>
      </Modal>
      <Modal opened={cardModalOpened} onClose={cardModalHandlers.close} title="Nueva tarjeta" centered radius="xl">
        <Stack>
          <TextInput label="Nombre" value={cardDraft.nm} onChange={event => setCardDraft(current => ({ ...current, nm: event.currentTarget.value }))} />
          <NumberInput label="Límite" hideControls thousandSeparator="," value={cardDraft.limit} onChange={value => setCardDraft(current => ({ ...current, limit: Number(value) || 0 }))} />
          <NumberInput label="Saldo actual" hideControls thousandSeparator="," value={cardDraft.balance} onChange={value => setCardDraft(current => ({ ...current, balance: Number(value) || 0 }))} />
          <TextInput label="Últimos 4 dígitos" value={cardDraft.last4} onChange={event => setCardDraft(current => ({ ...current, last4: event.currentTarget.value }))} />
          <Group grow>
            <NumberInput label="Corte" hideControls value={cardDraft.closing} onChange={value => setCardDraft(current => ({ ...current, closing: Number(value) || 0 }))} />
            <NumberInput label="Pago" hideControls value={cardDraft.due} onChange={value => setCardDraft(current => ({ ...current, due: Number(value) || 0 }))} />
          </Group>
          <Button onClick={saveCard}>Guardar tarjeta</Button>
        </Stack>
      </Modal>
      <Modal opened={savingModalOpened} onClose={savingModalHandlers.close} title="Nueva meta de ahorro" centered radius="xl">
        <Stack>
          <TextInput label="Nombre" value={savingDraft.nm} onChange={event => setSavingDraft(current => ({ ...current, nm: event.currentTarget.value }))} />
          <NumberInput label="Meta" hideControls thousandSeparator="," value={savingDraft.target} onChange={value => setSavingDraft(current => ({ ...current, target: Number(value) || 0 }))} />
          <NumberInput label="Ahorrado actual" hideControls thousandSeparator="," value={savingDraft.current} onChange={value => setSavingDraft(current => ({ ...current, current: Number(value) || 0 }))} />
          <TextInput label="Fecha objetivo" type="date" value={savingDraft.due} onChange={event => setSavingDraft(current => ({ ...current, due: event.currentTarget.value }))} />
          <NumberInput label="Aporte mensual" hideControls thousandSeparator="," value={savingDraft.monthly} onChange={value => setSavingDraft(current => ({ ...current, monthly: Number(value) || 0 }))} />
          <Button onClick={saveSaving}>Guardar ahorro</Button>
        </Stack>
      </Modal>
    </Box>
  );
}

function UniformCard({ children, onClick, style }) {
  return (
    <Card radius="xl" withBorder p="lg" className="uniform-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </Card>
  );
}