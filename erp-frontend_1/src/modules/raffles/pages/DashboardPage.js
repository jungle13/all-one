// raffle-frontend/src/pages/DashboardPage.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from './DashboardPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faTicketAlt, faUsers, faChartLine, faDollarSign, faArrowUp, faArrowDown, faBullseye, faClock, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../../../core/api/apiClient';

const DashboardPage = () => {
    // --- ESTADOS PARA CARGAR DATOS DE LA API ---
    const [raffles, setRaffles] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- ESTADOS PARA LOS FILTROS Y SIMULACIÓN ---
    const [selectedRaffleId, setSelectedRaffleId] = useState('all');
    const [simulatedPrizeCost, setSimulatedPrizeCost] = useState(0);
    const [simulatedOperationalCosts, setSimulatedOperationalCosts] = useState(100000);

    // --- EFECTO UNIFICADO PARA CARGAR TODOS LOS DATOS ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Carga los datos de las rifas y los datos de ventas en paralelo
                const [rafflesRes, salesRes] = await Promise.all([
                    apiClient.get('/raffle/'), // <-- CAMBIO
                    apiClient.get('/tickets/sales/monthly_summary') // <-- CAMBIO
                ]);
                setRaffles(rafflesRes.data.raffles || []);
                setSalesData(salesRes.data || []);
            } catch (err) {
                setError("No se pudieron cargar los datos del dashboard. Verifica que el backend esté funcionando.");
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Hook para actualizar costos al cambiar de rifa
    useEffect(() => {
        if (selectedRaffleId === 'all') {
            setSimulatedPrizeCost(0);
        } else {
            const selectedRaffle = raffles.find(r => r.id === selectedRaffleId);
            setSimulatedPrizeCost(selectedRaffle?.prizeCost || 0); 
        }
    }, [selectedRaffleId, raffles]);
    
    // Hook para calcular los KPIs
    // --- AJUSTE EN EL CÁLCULO DE KPIS ---
    const kpiData = useMemo(() => {
        if (!raffles || raffles.length === 0) return null;

        let totalRevenue = 0;
        let totalPrizeCosts = 0;
        let ticketsSoldPaid = 0;
        let ticketsSoldPending = 0;
        let activeRafflesCount = 0;

        raffles.forEach(r => {
            totalRevenue += (r.statistics?.tickets_sold || 0) * (r.price || 0);
            totalPrizeCosts += r.prize_cost || 0;
            if (r.status === 'active') {
                activeRafflesCount++;
            }
            // Suponiendo que el backend nos da un desglose (si no, habría que fetchear todos los tickets)
            // Por ahora, simulamos un desglose para el KPI.
            ticketsSoldPaid += Math.floor((r.statistics?.tickets_sold || 0) * 0.8); // Asumimos 80% pagados
            ticketsSoldPending += Math.ceil((r.statistics?.tickets_sold || 0) * 0.2); // Asumimos 20% pendientes
        });

        const totalTicketsSold = ticketsSoldPaid + ticketsSoldPending;
        const totalOperationalCosts = raffles.length * 100000; // Costo operativo general
        const totalCosts = totalOperationalCosts + totalPrizeCosts;
        const profitMargin = totalRevenue - totalCosts;

        // --- Nuevos KPIs de Meta de Rentabilidad (100%) ---
        const revenueFor100Profit = totalCosts * 2; // Ingresos necesarios para duplicar costos
        const avgTicketPrice = totalTicketsSold > 0 ? totalRevenue / (ticketsSoldPaid + ticketsSoldPending) : 0;
        const ticketsFor100Profit = avgTicketPrice > 0 ? Math.ceil(revenueFor100Profit / avgTicketPrice) : 0;
        const remainingTicketsForGoal = Math.max(0, ticketsFor100Profit - (ticketsSoldPaid + ticketsSoldPending));
        
        const dailyAvgSales = salesData.reduce((acc, s) => acc + s.tickets_sold, 0) / new Date().getDate();
        const daysToGoal = (dailyAvgSales > 0 && remainingTicketsForGoal > 0) ? Math.ceil(remainingTicketsForGoal / dailyAvgSales) : '∞';

        return {
            totalRevenue,
            totalCosts,
            profitMargin,
            ticketsSoldPaid,
            ticketsSoldPending,
            activeRafflesCount,
            revenueFor100Profit,
            ticketsFor100Profit,
            remainingTicketsForGoal,
            daysToGoal
        };
    }, [raffles, salesData]);
    
    // Hook para procesar datos de la gráfica
    const chartData = useMemo(() => {
        // ... (Tu lógica para chartData no necesita cambios)
        if (!salesData || salesData.length === 0) return { data: [], sellers: [] };
        const dataByDate = {};
        const sellers = new Set();
        salesData.forEach(item => {
            const day = new Date(item.sale_date).getDate();
            if (!dataByDate[day]) { dataByDate[day] = { day }; }
            dataByDate[day][item.seller] = item.tickets_sold;
            sellers.add(item.seller);
        });
        const monthDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const formattedData = [];
        for (let i = 1; i <= monthDays; i++) {
            const dayData = { day: i };
            sellers.forEach(seller => { dayData[seller] = dataByDate[i]?.[seller] || 0; });
            formattedData.push(dayData);
        }
        return { data: formattedData, sellers: Array.from(sellers) };
    }, [salesData]);
    
    
    // ===================================================================
    // --- LÓGICA DE CÁLCULO DE INSIGHTS (CORREGIDA Y RESTAURADA) ---
    // ===================================================================
    const insights = useMemo(() => {
        if (!raffles || raffles.length === 0) return { noData: true };

        const targetRaffles = selectedRaffleId === 'all' 
            ? raffles 
            : raffles.filter(r => r.id === selectedRaffleId);

        if (targetRaffles.length === 0 && selectedRaffleId !== 'all') {
            return { noData: true }; // Maneja el caso en que la rifa seleccionada no se encuentre
        }

        let aggregatedInsights = {
            raffleName: selectedRaffleId === 'all' ? 'Todas las Rifas (Agregado)' : targetRaffles[0]?.name,
            totalPossibleTickets: 0,
            ticketPrice: 0,
            prizeCost: parseFloat(simulatedPrizeCost) || 0,
            operationalCosts: parseFloat(simulatedOperationalCosts) || 0,
            maxPotentialRevenue: 0,
            currentSales: { ticketsSold: 0, revenue: 0 }
        };

        let totalSoldCount = 0;
        let totalRevenueFromSold = 0;
        let totalPossibleTicketCount = 0;
        let totalMaxPotentialRevenue = 0;

        targetRaffles.forEach(raffle => {
            const digits = raffle.dijits_per_number || 0;
            const numbersPerTicket = raffle.numbers_per_ticket || 1;
            const excludedCount = raffle.excluded_numbers?.length || 0;
            
            const universe = Math.pow(10, digits);
            const sellableNumbers = universe - excludedCount;
            const possibleTicketsForThisRaffle = Math.floor(sellableNumbers / numbersPerTicket);

            totalPossibleTicketCount += possibleTicketsForThisRaffle;
            totalMaxPotentialRevenue += possibleTicketsForThisRaffle * (raffle.price || 0);
            totalSoldCount += raffle.statistics?.tickets_sold || 0;
            totalRevenueFromSold += (raffle.statistics?.tickets_sold || 0) * (raffle.price || 0);
        });

        aggregatedInsights.totalPossibleTickets = totalPossibleTicketCount;
        aggregatedInsights.maxPotentialRevenue = totalMaxPotentialRevenue;
        aggregatedInsights.currentSales.ticketsSold = totalSoldCount;
        aggregatedInsights.currentSales.revenue = totalRevenueFromSold;
        
        if (selectedRaffleId !== 'all' && targetRaffles.length === 1) {
            aggregatedInsights.ticketPrice = targetRaffles[0].price || 0;
        }

        aggregatedInsights.totalCosts = aggregatedInsights.prizeCost + aggregatedInsights.operationalCosts;
        aggregatedInsights.currentSales.currentProfit = aggregatedInsights.currentSales.revenue - aggregatedInsights.totalCosts;
        
        aggregatedInsights.currentSales.percentageSoldOfTotal = aggregatedInsights.totalPossibleTickets > 0
            ? ((aggregatedInsights.currentSales.ticketsSold / aggregatedInsights.totalPossibleTickets) * 100).toFixed(1)
            : 0;
            
        const avgPricePerTicket = (aggregatedInsights.maxPotentialRevenue / aggregatedInsights.totalPossibleTickets) || 1;

        aggregatedInsights.breakEvenTickets = avgPricePerTicket > 0 
            ? Math.ceil(aggregatedInsights.totalCosts / avgPricePerTicket) 
            : 0;

        aggregatedInsights.breakEvenPercentage = aggregatedInsights.totalPossibleTickets > 0
            ? ((aggregatedInsights.breakEvenTickets / aggregatedInsights.totalPossibleTickets) * 100).toFixed(1)
            : 0;

        aggregatedInsights.profitability = {};
        aggregatedInsights.ticketsForProfitability = {};
        aggregatedInsights.percentageForProfitability = {};

        [20, 30, 50, 100].forEach(p => {
            const desiredProfit = aggregatedInsights.totalCosts * (p / 100);
            const totalRevenueNeeded = aggregatedInsights.totalCosts + desiredProfit;
            const ticketsToSell = avgPricePerTicket > 0 ? Math.ceil(totalRevenueNeeded / avgPricePerTicket) : 0;
            
            aggregatedInsights.profitability[`p${p}`] = desiredProfit;
            aggregatedInsights.ticketsForProfitability[`p${p}`] = ticketsToSell;
            aggregatedInsights.percentageForProfitability[`p${p}`] = aggregatedInsights.totalPossibleTickets > 0
                ? ((ticketsToSell / aggregatedInsights.totalPossibleTickets) * 100).toFixed(1)
                : 0;
        });
        
        return aggregatedInsights; }, [raffles, selectedRaffleId, simulatedPrizeCost, simulatedOperationalCosts]);
    
    const sellerColors = { 'admin': '#8884d8', 'vendedor': '#82ca9d' };

    if (loading) return <div className={styles.dashboardContainer}><FontAwesomeIcon icon={faSpinner} spin /> Cargando...</div>;
    if (error) return <div className={styles.dashboardContainer}><FontAwesomeIcon icon={faExclamationTriangle} /> {error}</div>;
 
    return (
        <div className={styles.dashboardContainer}>
            <h1 className={styles.pageTitle}>Dashboard Principal</h1>

            {/* --- SECCIÓN DE KPIS (NUEVA) --- */}
            <div className={styles.kpiGrid}>
                {/* --- KPI 1: FINANZAS GENERALES (MODIFICADO) --- */}
                <div className={styles.kpiCard}>
                    <FontAwesomeIcon icon={faDollarSign} className={styles.kpiIcon} />
                    <div className={styles.kpiInfo}>
                        <span className={styles.kpiValue}>${kpiData?.totalRevenue.toLocaleString('es-CO') || 0}</span>
                        <span className={styles.kpiTitle}>Ingresos Totales</span>
                        <div className={styles.kpiSubgroup}>
                            <div className={styles.kpiSubInfo}><span className={styles.kpiSubTitle}>Costos Totales</span><span className={styles.kpiSubValue}>${kpiData?.totalCosts.toLocaleString('es-CO') || 0}</span></div>
                            <div className={styles.kpiSubInfo}><span className={styles.kpiSubTitle}>Margen</span><span className={`${styles.kpiSubValue} ${kpiData?.profitMargin >= 0 ? styles.profit : styles.loss}`}><FontAwesomeIcon icon={kpiData?.profitMargin >= 0 ? faArrowUp : faArrowDown} />${kpiData?.profitMargin.toLocaleString('es-CO') || 0}</span></div>
                        </div>
                    </div>
                </div>

                {/* --- KPI 2: TIQUETES VENDIDOS (MODIFICADO) --- */}
                <div className={styles.kpiCard}>
                    <FontAwesomeIcon icon={faTicketAlt} className={styles.kpiIcon} />
                    <div className={styles.kpiInfo}>
                        <span className={styles.kpiValue}>{(kpiData?.ticketsSoldPaid + kpiData?.ticketsSoldPending).toLocaleString() || 0}</span>
                        <span className={styles.kpiTitle}>Tiquetes Vendidos</span>
                        <div className={styles.kpiSubgroup}>
                            <div className={styles.kpiSubInfo}><span className={styles.kpiSubTitle}>Pagados</span><span className={`${styles.kpiSubValue} ${styles.paid}`}>{kpiData?.ticketsSoldPaid.toLocaleString() || 0}</span></div>
                            <div className={styles.kpiSubInfo}><span className={styles.kpiSubTitle}>Pendientes</span><span className={`${styles.kpiSubValue} ${styles.pending}`}>{kpiData?.ticketsSoldPending.toLocaleString() || 0}</span></div>
                        </div>
                    </div>
                </div>

                {/* --- KPI 3: META DE RENTABILIDAD EN TIQUETES (NUEVO) --- */}
                <div className={styles.kpiCard}>
                    <FontAwesomeIcon icon={faBullseye} className={styles.kpiIcon} />
                    <div className={styles.kpiInfo}>
                        <span className={styles.kpiValue}>{kpiData?.ticketsFor100Profit.toLocaleString() || 0}</span>
                        <span className={styles.kpiTitle}>Meta Tiquetes (100% Rentab.)</span>
                        <div className={styles.kpiSubgroup}>
                            <div className={styles.kpiSubInfo}><span className={styles.kpiSubTitle}>Faltan</span><span className={`${styles.kpiSubValue}`}>{kpiData?.remainingTicketsForGoal.toLocaleString() || 0}</span></div>
                            <div className={styles.kpiSubInfo}><span className={styles.kpiSubTitle}>Proyección</span><span className={styles.kpiSubValue}><FontAwesomeIcon icon={faClock} /> {kpiData?.daysToGoal} días</span></div>
                        </div>
                    </div>
                </div>

                {/* --- KPI 4: META DE RENTABILIDAD EN DINERO (NUEVO) --- */}
                <div className={styles.kpiCard}>
                    <FontAwesomeIcon icon={faChartLine} className={styles.kpiIcon} />
                    <div className={styles.kpiInfo}>
                        <span className={styles.kpiValue}>${kpiData?.revenueFor100Profit.toLocaleString('es-CO') || 0}</span>
                        <span className={styles.kpiTitle}>Meta Ingresos (100% Rentab.)</span>
                        <div className={styles.kpiSubgroup}>
                            <div className={styles.kpiSubInfo}><span className={styles.kpiSubTitle}>Ingreso Actual</span><span className={`${styles.kpiSubValue} ${styles.paid}`}>${kpiData?.totalRevenue.toLocaleString('es-CO') || 0}</span></div>
                            <div className={styles.kpiSubInfo}><span className={styles.kpiSubTitle}>Faltante</span><span className={styles.kpiSubValue}>${(kpiData?.revenueFor100Profit - kpiData?.totalRevenue).toLocaleString('es-CO') || 0}</span></div>
                        </div>
                    </div>
                </div>
            </div> 

            {/* --- SECCIÓN DE GRÁFICA (NUEVA) --- */}
            <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>Ventas del Mes por Vendedor</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" label={{ value: 'Día del Mes', position: 'insideBottom', offset: -5 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        {chartData.sellers.map(seller => (
                            <Line key={seller} type="monotone" dataKey={seller} stroke={sellerColors[seller] || '#000000'} activeDot={{ r: 8 }} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <hr className={styles.divider} /> {/* Un separador visual */}

            {/* --- SECCIÓN DE INSIGHTS FINANCIEROS (EXISTENTE) --- */}
            <h1 className={styles.pageTitle}>Insights Financieros</h1>
            
            <div className={styles.filtersContainer}>
                <label htmlFor="raffleFilter">Seleccionar Rifa para Simulación:</label>
                <select id="raffleFilter" value={selectedRaffleId} onChange={(e) => setSelectedRaffleId(e.target.value)}>
                    <option value="all">Todas las Rifas</option>
                    {raffles.map(raffle => (
                        <option key={raffle.id} value={raffle.id}>{raffle.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.costsInputContainer}>
                <h2>Simulación de Costos ({insights.raffleName})</h2>
                <div>
                    <label htmlFor="prizeCostInput">Costo del Premio ($):</label>
                    <input type="number" id="prizeCostInput" value={simulatedPrizeCost} onChange={(e) => setSimulatedPrizeCost(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                    <label htmlFor="operationalCosts">Costos Operativos Totales ($):</label>
                    <input type="number" id="operationalCosts" value={simulatedOperationalCosts} onChange={(e) => setSimulatedOperationalCosts(parseFloat(e.target.value) || 0)} />
                </div>
                <p><strong>Costo Total (Premio + Operativos): ${insights.totalCosts?.toLocaleString() || 0}</strong></p>
            </div>

            <div className={styles.insightsGrid}>
                <div className={styles.insightCard}>
                    <h3>Definición de la Rifa ({insights.raffleName})</h3>
                    <p><strong>Total de Tiquetes Vendibles:</strong> {insights.totalPossibleTickets?.toLocaleString() || 0}</p>
                    {insights.ticketPrice > 0 && <p><strong>Precio por Tiquete:</strong> ${insights.ticketPrice.toLocaleString()}</p>}
                    <p><strong>Ingreso Máximo Potencial:</strong> ${insights.maxPotentialRevenue?.toLocaleString() || 0}</p>
                </div>
                <div className={styles.insightCard}>
                    <h3>Ventas Actuales ({insights.raffleName})</h3>
                    <p><strong>Tiquetes Vendidos:</strong> {insights.currentSales?.ticketsSold.toLocaleString() || 0} / {insights.totalPossibleTickets?.toLocaleString() || 0} ({insights.currentSales?.percentageSoldOfTotal || 0}%)</p>
                    <p><strong>Ingresos Actuales:</strong> ${insights.currentSales?.revenue.toLocaleString() || 0}</p>
                    <p><strong>Ganancia/Pérdida Actual:</strong> ${insights.currentSales?.currentProfit.toLocaleString() || 0}</p>
                </div>
                <div className={styles.insightCard}>
                    <h3>Punto de Equilibrio</h3>
                    <p><strong>Tiquetes para Cubrir Costos:</strong> {insights.breakEvenTickets?.toLocaleString() || 0}</p>
                    <p>Representa el <strong>{insights.breakEvenPercentage || 0}%</strong> del total de tiquetes.</p>
                </div>
                {[20, 30, 50, 100].map(p => (
                    <div key={p} className={styles.insightCard}>
                        <h3>Objetivo: Rentabilidad del {p}%</h3>
                        <p><strong>Ganancia Deseada:</strong> ${insights.profitability?.[`p${p}`]?.toLocaleString() || 0}</p>
                        <p><strong>Tiquetes a Vender:</strong> {insights.ticketsForProfitability?.[`p${p}`]?.toLocaleString() || 0}</p>
                        <p>Representa el <strong>{insights.percentageForProfitability?.[`p${p}`] || 0}%</strong> del total de tiquetes.</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;