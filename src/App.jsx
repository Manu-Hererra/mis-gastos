import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function dbGet(table, order) {
  const q = supabase.from(table).select("*");
  if (order) q.order(order.col, { ascending: order.asc ?? true });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}
async function dbUpsert(table, rows) {
  const { error } = await supabase.from(table).upsert(rows);
  if (error) throw new Error(error.message);
}
async function dbDelete(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Utils ────────────────────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function dateToMonth(s) {
  const d = new Date(s + "T12:00:00");
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function dateToPeriodo(s, dc) {
  const d = new Date(s + "T12:00:00");
  if (d.getDate() <= dc) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const n = new Date(d.getFullYear(), d.getMonth()+1, 1);
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
}
function currentPeriodo(dc) {
  const d = new Date();
  if (d.getDate() <= dc) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const n = new Date(d.getFullYear(), d.getMonth()+1, 1);
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`;
}
function prevMk(mk) {
  const [y,m] = mk.split("-").map(Number);
  const d = new Date(y,m-2,1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function nextMk(mk) {
  const [y,m] = mk.split("-").map(Number);
  const d = new Date(y,m,1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function monthLabel(mk) {
  const [y,m] = mk.split("-").map(Number);
  return new Date(y,m-1,1).toLocaleDateString("es-AR",{month:"long",year:"numeric"});
}
function periodoLabel(mk,dc) {
  const [y,m] = mk.split("-").map(Number);
  const fmt = d => d.toLocaleDateString("es-AR",{day:"numeric",month:"short"});
  return `${fmt(new Date(y,m-2,dc+1))} – ${fmt(new Date(y,m-1,dc))}`;
}
function dateLabel(s) {
  const tod  = todayStr();
  const d    = new Date(); d.setDate(d.getDate()-1);
  const yest = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  if (s===tod)  return "Hoy";
  if (s===yest) return "Ayer";
  return new Date(s+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});
}
function formatARS(n) {
  return new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n||0);
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return ["Buenos días", "☀️"];
  if (h < 20) return ["Buenas tardes", "🌤️"];
  return ["Buenas noches", "🌙"];
}
function loadSettings() {
  try { return JSON.parse(localStorage.getItem("mg_settings")||"{}"); } catch { return {}; }
}

// ─── Frases motivacionales ────────────────────────────────────────────────────
const FRASES = [
  { texto: "El único modo de hacer un gran trabajo es amar lo que hacés.", autor: "Steve Jobs" },
  { texto: "No contés los días, hacé que los días cuenten.", autor: "Muhammad Ali" },
  { texto: "La vida es lo que pasa mientras estás ocupado haciendo otros planes.", autor: "John Lennon" },
  { texto: "Caer está permitido. Levantarse es obligatorio.", autor: "" },
  { texto: "No hay que apagar la luz del otro para que brille la propia.", autor: "Gandhi" },
  { texto: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", autor: "Robert Collier" },
  { texto: "Sé el cambio que querés ver en el mundo.", autor: "Gandhi" },
  { texto: "Las personas que están lo suficientemente locas como para pensar que pueden cambiar el mundo, son las que lo hacen.", autor: "Steve Jobs" },
  { texto: "No importa lo lento que vayas mientras no te detengas.", autor: "Confucio" },
  { texto: "Todo parece imposible hasta que se hace.", autor: "Nelson Mandela" },
  { texto: "Vivir es lo más raro del mundo. La mayoría de la gente solo existe.", autor: "Oscar Wilde" },
  { texto: "La actitud determina la dirección.", autor: "" },
  { texto: "Cada día es una nueva oportunidad para cambiar tu vida.", autor: "" },
  { texto: "El fracaso es solo la oportunidad de comenzar de nuevo, esta vez con más inteligencia.", autor: "Henry Ford" },
  { texto: "Lo que no te mata te hace más fuerte.", autor: "Friedrich Nietzsche" },
  { texto: "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.", autor: "Proverbio chino" },
  { texto: "No te rindas. El principio siempre es lo más difícil.", autor: "" },
  { texto: "La disciplina es elegir entre lo que querés ahora y lo que más querés.", autor: "Abraham Lincoln" },
  { texto: "Quien tiene un porqué para vivir puede soportar casi cualquier cómo.", autor: "Friedrich Nietzsche" },
  { texto: "Haz hoy lo que otros no quieren para tener mañana lo que otros no tienen.", autor: "" },
  { texto: "La felicidad no es un destino, es una forma de viajar.", autor: "Margaret Lee Runbeck" },
  { texto: "Nunca es demasiado tarde para ser lo que podrías haber sido.", autor: "George Eliot" },
  { texto: "El coraje no es la ausencia del miedo, sino el juicio de que algo más importa.", autor: "Ambrose Redmoon" },
  { texto: "Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto sino un hábito.", autor: "Aristóteles" },
  { texto: "No busques que las cosas que suceden sucedan como quieres. Desea que las cosas que suceden sean como son y encontrarás tranquilidad.", autor: "Epicteto" },
  { texto: "La mente que se abre a una nueva idea, jamás vuelve a su tamaño original.", autor: "Albert Einstein" },
  { texto: "El único límite a nuestra realización de mañana serán nuestras dudas de hoy.", autor: "Franklin D. Roosevelt" },
  { texto: "En medio de la dificultad reside la oportunidad.", autor: "Albert Einstein" },
  { texto: "La vida no se mide por la cantidad de veces que respiramos, sino por los momentos que nos quitan el aliento.", autor: "" },
  { texto: "Primero formamos hábitos, y luego los hábitos nos forman a nosotros.", autor: "John Dryden" },
];

function fraseDelDia() {
  const inicio = new Date(new Date().getFullYear(), 0, 0);
  const dia = Math.floor((new Date() - inicio) / 86400000);
  return FRASES[dia % FRASES.length];
}

// ─── Datos estáticos ──────────────────────────────────────────────────────────
const MEDIOS = [
  { id:"efectivo", name:"Efectivo", icon:"💵", color:"#10b981" },
  { id:"debito",   name:"Débito",   icon:"🏦", color:"#3b82f6" },
  { id:"credito",  name:"Crédito",  icon:"💳", color:"#f59e0b" },
];
const CATS = [
  { id:"hogar",         name:"Hogar",        icon:"🏡", color:"#6366f1" },
  { id:"expensas",      name:"Expensas",      icon:"🏢", color:"#8b5cf6" },
  { id:"supermercado",  name:"Super",         icon:"🛒", color:"#10b981" },
  { id:"transporte",    name:"Transporte",    icon:"🚌", color:"#3b82f6" },
  { id:"salidas",       name:"Salidas",       icon:"🍕", color:"#f59e0b" },
  { id:"gym",           name:"Gym",           icon:"💪", color:"#ef4444" },
  { id:"suscripciones", name:"Suscripciones", icon:"📱", color:"#ec4899" },
  { id:"farmacia",      name:"Farmacia",      icon:"💊", color:"#14b8a6" },
  { id:"indumentaria",  name:"Ropa",          icon:"👕", color:"#f97316" },
  { id:"otros",         name:"Otros",         icon:"📦", color:"#94a3b8" },
];
const getCat   = id => CATS.find(c=>c.id===id)   ?? CATS[CATS.length-1];
const getMedio = id => MEDIOS.find(m=>m.id===id) ?? MEDIOS[0];

const NAV_ITEMS = [
  { id:"home",     icon:"🏠", label:"Inicio"         },
  { id:"gastos",   icon:"💸", label:"Gastos del mes"  },
  { id:"fijos",    icon:"🔁", label:"Gastos fijos"    },
  { id:"medios",   icon:"💳", label:"Medios de pago"  },
  { id:"analisis", icon:"📊", label:"Análisis"        },
  { id:"metas",    icon:"🎯", label:"Metas de ahorro" },
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,            setTab]            = useState("home");
  const [drawer,         setDrawer]         = useState(false);
  const [vista,          setVista]          = useState("mes");
  const [period,         setPeriod]         = useState(currentMonth());
  const [gastos,         setGastos]         = useState([]);
  const [fijos,          setFijos]          = useState([]);
  const [metas,          setMetas]          = useState([]);
  const [contribuciones, setContribuciones] = useState([]);
  const [dolar,          setDolar]          = useState(null);
  const [modal,          setModal]          = useState(null);
  const [editing,        setEditing]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [settings,       setSettings]       = useState(loadSettings);

  const diaClose = Number(settings.diaClose) || null;
  const sueldo   = Number(settings.sueldo)   || 0;

  function guardarSettings(data) {
    const next = { ...settings, ...data };
    setSettings(next);
    localStorage.setItem("mg_settings", JSON.stringify(next));
  }
  function cambiarVista(v) {
    setVista(v);
    setPeriod(v==="cierre" && diaClose ? currentPeriodo(diaClose) : currentMonth());
  }
  function navTo(id) { setTab(id); setDrawer(false); }

  async function recargar() {
    const [exp, fix, met, con] = await Promise.all([
      dbGet("expenses",              { col:"date",       asc:false }),
      dbGet("fixed_expenses",        { col:"created_at", asc:true  }),
      dbGet("savings_goals",         { col:"created_at", asc:true  }),
      dbGet("savings_contributions", { col:"date",        asc:false }),
    ]);
    setGastos(exp); setFijos(fix); setMetas(met); setContribuciones(con);
    return { exp, fix, met, con };
  }

  useEffect(()=>{
    fetch("https://dolarapi.com/v1/dolares")
      .then(r=>r.json())
      .then(data=>{
        const find = casa => data.find(d=>d.casa===casa)?.venta ?? null;
        setDolar({ mep: find("bolsa"), blue: find("blue"), oficial: find("oficial") });
      }).catch(()=>{});
  },[]);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const {exp, fix} = await recargar();
        const hoy = new Date();
        const meses = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
          meses.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
        }
        const fijosActivos = fix.filter(f => f.activo !== false);
        const filas = [];
        for (const f of fijosActivos) {
          const fCreatedMk = f.created_at ? f.created_at.substring(0, 7) : meses[0];
          for (const mk of meses) {
            if (mk < fCreatedMk) continue;
            const yaExiste = exp.some(e => e.fixed_ref === f.id && dateToMonth(e.date) === mk);
            if (!yaExiste) {
              const dia = Number(f.dia_recurrencia) || 1;
              const [y, m] = mk.split("-").map(Number);
              const daysInMonth = new Date(y, m, 0).getDate();
              const dayToUse = Math.min(dia, daysInMonth);
              const dateStr = `${y}-${String(m).padStart(2,"0")}-${String(dayToUse).padStart(2,"0")}`;
              filas.push({
                id: uid(), description: f.description, amount: f.amount,
                category: f.category, card: f.card,
                date: dateStr, is_fixed: true, fixed_ref: f.id,
              });
            }
          }
        }
        if (filas.length > 0) {
          await dbUpsert("expenses", filas);
          await recargar();
        }
      } catch(e){ console.error(e.message); }
      setLoading(false);
    })();
  },[]);

  const gastosPeriodo = gastos.filter(e =>
    vista==="cierre" && diaClose
      ? dateToPeriodo(e.date, diaClose)===period
      : dateToMonth(e.date)===period
  );
  const totalPeriodo = gastosPeriodo.reduce((s,e)=>s+Number(e.amount),0);
  const esActual = vista==="cierre" && diaClose
    ? period===currentPeriodo(diaClose)
    : period===currentMonth();
  const labelPeriod = vista==="cierre" && diaClose
    ? periodoLabel(period, diaClose) : monthLabel(period);

  function irPrev() { setPeriod(prevMk(period)); }
  function irNext() { if (!esActual) setPeriod(nextMk(period)); }

  async function guardarGasto(data) {
    setSaving(true);
    try {
      const n = Number(data.cuotas) || 1;
      if (n > 1 && !editing) {
        const grupo = uid();
        const [y, m, d] = data.date.split("-").map(Number);
        const rows = Array.from({ length: n }, (_, i) => {
          const dt = new Date(y, m - 1 + i, d);
          const dateStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
          return {
            id: uid(), description: data.description, amount: Number(data.amount),
            category: data.category, card: data.card, date: dateStr,
            is_fixed: false, fixed_ref: null,
            cuotas: n, cuota_num: i + 1, cuota_grupo: grupo,
            tags: data.tags || null,
          };
        });
        await dbUpsert("expenses", rows);
      } else {
        await dbUpsert("expenses", [{
          id: editing?.id || uid(),
          description: data.description, amount: Number(data.amount),
          category: data.category, card: data.card,
          date: data.date, is_fixed: false, fixed_ref: null,
          cuotas: editing?.cuotas ?? null,
          cuota_num: editing?.cuota_num ?? null,
          cuota_grupo: editing?.cuota_grupo ?? null,
          tags: data.tags || null,
        }]);
      }
      await recargar(); cerrarModal();
    } catch(e){ alert("Error al guardar: "+e.message); }
    setSaving(false);
  }
  async function eliminarGasto(id) {
    setSaving(true);
    try { await dbDelete("expenses", id); await recargar(); cerrarModal(); }
    catch(e){ alert(e.message); }
    setSaving(false);
  }
  async function guardarFijo(data) {
    setSaving(true);
    try {
      const fid = editing?.id || uid();
      await dbUpsert("fixed_expenses", [{
        id: fid, description: data.description, amount: Number(data.amount),
        category: data.category, card: data.card,
        dia_recurrencia: Number(data.dia_recurrencia) || null,
        activo: data.activo !== false,
      }]);
      if (!editing) {
        const dia = Number(data.dia_recurrencia) || new Date().getDate();
        const hoy = new Date();
        const daysInMonth = new Date(hoy.getFullYear(), hoy.getMonth()+1, 0).getDate();
        const dayToUse = Math.min(dia, daysInMonth);
        const dateStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(dayToUse).padStart(2,"0")}`;
        await dbUpsert("expenses", [{id:uid(), description:data.description, amount:Number(data.amount), category:data.category, card:data.card, date:dateStr, is_fixed:true, fixed_ref:fid}]);
      }
      await recargar(); cerrarModal();
    } catch(e){ alert(e.message); }
    setSaving(false);
  }
  async function eliminarFijo(id) {
    setSaving(true);
    try { await dbDelete("fixed_expenses", id); await recargar(); cerrarModal(); }
    catch(e){ alert(e.message); }
    setSaving(false);
  }

  async function guardarMeta(data) {
    setSaving(true);
    try {
      await dbUpsert("savings_goals", [{
        id: editing?.id || uid(),
        name: data.name,
        target_amount: Number(data.target_amount),
        target_date: data.target_date || null,
      }]);
      await recargar(); cerrarModal();
    } catch(e){ alert("Error: " + e.message); }
    setSaving(false);
  }
  async function eliminarMeta(id) {
    setSaving(true);
    try { await dbDelete("savings_goals", id); await recargar(); cerrarModal(); }
    catch(e){ alert(e.message); }
    setSaving(false);
  }
  async function guardarContribucion(data) {
    setSaving(true);
    try {
      await dbUpsert("savings_contributions", [{
        id: uid(), goal_id: data.goal_id,
        amount: Number(data.amount), date: data.date, note: data.note || null,
      }]);
      await recargar(); cerrarModal();
    } catch(e){ alert("Error: " + e.message); }
    setSaving(false);
  }
  async function eliminarContribucion(id) {
    setSaving(true);
    try { await dbDelete("savings_contributions", id); await recargar(); }
    catch(e){ alert(e.message); }
    setSaving(false);
  }

  function abrirModal(tipo, item=null) { setEditing(item); setModal(tipo); }
  function cerrarModal()               { setModal(null); setEditing(null); }

  if (loading) return <Splash />;

  const gastosMesActual = gastos.filter(e=>dateToMonth(e.date)===currentMonth());
  const totalMesActual  = gastosMesActual.reduce((s,e)=>s+Number(e.amount),0);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* Sidebar — siempre visible en desktop, drawer en mobile */}
        <div className={`drawer-overlay${drawer?" open":""}`} onClick={()=>setDrawer(false)}/>
        <aside className={`drawer${drawer?" open":""}`}>
          <div className="drawer-header">
            <div className="drawer-logo-wrap">
              <span className="drawer-logo">💸</span>
            </div>
            <div>
              <div className="drawer-app-name">Mis Gastos</div>
              <div className="drawer-tagline">Control de finanzas</div>
            </div>
          </div>
          <nav className="drawer-nav">
            {NAV_ITEMS.map(n=>(
              <button key={n.id} className={`drawer-item${tab===n.id?" active":""}`} onClick={()=>navTo(n.id)}>
                <span className="drawer-icon">{n.icon}</span>
                <span className="drawer-label">{n.label}</span>
                {tab===n.id && <span className="drawer-pip"/>}
              </button>
            ))}
          </nav>
          <div className="drawer-footer">
            <button className="drawer-cfg" onClick={()=>{setDrawer(false);abrirModal("settings");}}>
              ⚙️ <span>Configuración</span>
            </button>
          </div>
        </aside>

        {/* Columna principal */}
        <div className="main-col">
          <header className={`topbar${tab==="home"?" topbar-home":""}`}>
            <button className="ham-btn" onClick={()=>setDrawer(true)}>
              <span/><span/><span/>
            </button>
            <div className="brand">
              <span className="logo">💸</span>
              <span className="app-name">Mis Gastos</span>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {saving && <span className="saving-txt">Guardando…</span>}
              <button className="icon-btn" onClick={()=>abrirModal("settings")}>⚙️</button>
            </div>
          </header>

          <div className="content">
            {tab==="home"     && <HomeTab gastosMes={gastosMesActual} totalMes={totalMesActual} sueldo={sueldo} fijos={fijos} onNavTo={navTo} onAgregar={()=>abrirModal("gasto")}/>}
            {tab==="gastos"   && <GastosTab gastos={gastosPeriodo} label={labelPeriod} total={totalPeriodo} vista={vista} diaClose={diaClose} esActual={esActual} onPrev={irPrev} onNext={irNext} onCambiarVista={cambiarVista} onAgregar={()=>abrirModal("gasto")} onEditar={e=>abrirModal("gasto",e)}/>}
            {tab==="fijos"    && <FijosTab fijos={fijos} onAgregar={()=>abrirModal("fijo")} onEditar={f=>abrirModal("fijo",f)}/>}
            {tab==="medios"   && <MediosTab gastos={gastosPeriodo} total={totalPeriodo} label={labelPeriod} esActual={esActual} onPrev={irPrev} onNext={irNext}/>}
            {tab==="analisis" && <AnalisisTab gastos={gastosPeriodo} todosGastos={gastos} total={totalPeriodo} label={labelPeriod} sueldo={sueldo} esActual={esActual} onPrev={irPrev} onNext={irNext} onEditarSueldo={()=>abrirModal("settings")} dolar={dolar} diaClose={diaClose}/>}
            {tab==="metas"    && <MetasTab metas={metas} contribuciones={contribuciones} saving={saving} onNuevaMeta={()=>abrirModal("meta")} onEditarMeta={m=>abrirModal("meta",m)} onEliminarMeta={id=>eliminarMeta(id)} onAgregarAporte={m=>abrirModal("contribucion",m)} onEliminarAporte={id=>eliminarContribucion(id)}/>}
          </div>
        </div>
      </div>

      {modal==="gasto"        && <GastoModal        gasto={editing}  saving={saving} onGuardar={guardarGasto}       onEliminar={editing?()=>eliminarGasto(editing.id):null}  onCerrar={cerrarModal}/>}
      {modal==="fijo"         && <FijoModal         fijo={editing}   saving={saving} onGuardar={guardarFijo}        onEliminar={editing?()=>eliminarFijo(editing.id):null}    onCerrar={cerrarModal}/>}
      {modal==="meta"         && <MetaModal         meta={editing}   saving={saving} onGuardar={guardarMeta}        onEliminar={editing?()=>eliminarMeta(editing.id):null}    onCerrar={cerrarModal}/>}
      {modal==="contribucion" && <ContribucionModal meta={editing}   saving={saving} onGuardar={guardarContribucion}                                                           onCerrar={cerrarModal}/>}
      {modal==="settings"     && <SettingsModal settings={settings} onGuardar={guardarSettings} onCerrar={cerrarModal}/>}
    </>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeTab({ gastosMes, totalMes, sueldo, fijos, onNavTo, onAgregar }) {
  const [saludo, icono] = greeting();
  const ahorro   = sueldo - totalMes;
  const pctGasto = sueldo > 0 ? Math.min(100,(totalMes/sueldo)*100) : 0;
  const recientes = [...gastosMes].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
  const totalFijos = fijos.reduce((s,f)=>s+Number(f.amount),0);

  const frase = fraseDelDia();

  return (
    <>
      {/* Hero bienvenida */}
      <div className="home-hero">
        <div className="home-hero-glow"/>

        {/* Saludo + frase en la misma fila */}
        <div className="home-top-row">
          <div className="home-saludo-col">
            <span className="home-icono-saludo">{icono}</span>
            <span className="home-saludo">{saludo}</span>
          </div>
          <div className="home-frase-col">
            <div className="home-frase-comilla">"</div>
            <div className="home-frase-texto">{frase.texto}</div>
            {frase.autor && <div className="home-frase-autor">— {frase.autor}</div>}
          </div>
        </div>

        {/* Resumen del mes */}
        <div className="home-mes-card">
          <div className="home-mes-label">{monthLabel(currentMonth())}</div>
          <div className="home-mes-total">{formatARS(totalMes)}</div>
          {sueldo > 0 && (
            <div className="home-mes-ahorro">
              {ahorro >= 0
                ? <span className="ahorro-pos">Ahorrás {formatARS(ahorro)}</span>
                : <span className="ahorro-neg">Déficit {formatARS(Math.abs(ahorro))}</span>
              }
            </div>
          )}
          {sueldo > 0 && (
            <div className="home-barra-wrap">
              <div className="home-barra-track">
                <div className="home-barra-fill" style={{
                  width:`${pctGasto}%`,
                  background: pctGasto>90?"#f43f5e":pctGasto>70?"#fbbf24":"rgba(255,255,255,.85)"
                }}/>
              </div>
              <div className="home-barra-pct">{pctGasto.toFixed(0)}% del sueldo</div>
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="home-section-title">Secciones</div>
      <div className="shortcuts-grid">
        {[
          {id:"gastos",   icon:"💸", label:"Gastos",   color:"#3b82f6"},
          {id:"fijos",    icon:"🔁", label:"Fijos",    color:"#8b5cf6"},
          {id:"medios",   icon:"💳", label:"Medios",   color:"#f59e0b"},
          {id:"analisis", icon:"📊", label:"Análisis", color:"#10b981"},
        ].map(s=>(
          <button key={s.id} className="shortcut" onClick={()=>onNavTo(s.id)}
            style={{"--sc":s.color}}>
            <div className="shortcut-icon-wrap">{s.icon}</div>
            <span className="shortcut-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Mini stats */}
      <div className="home-stats">
        <div className="home-stat">
          <span className="home-stat-val">{gastosMes.length}</span>
          <span className="home-stat-label">movimientos</span>
        </div>
        <div className="home-stat-div"/>
        <div className="home-stat">
          <span className="home-stat-val">{formatARS(totalFijos)}</span>
          <span className="home-stat-label">gastos fijos</span>
        </div>
        {sueldo > 0 && <>
          <div className="home-stat-div"/>
          <div className="home-stat">
            <span className="home-stat-val" style={{color:ahorro>=0?"#34d399":"#f43f5e"}}>{ahorro>=0?"+":""}{pctGasto>0?(100-pctGasto).toFixed(0):0}%</span>
            <span className="home-stat-label">ahorrado</span>
          </div>
        </>}
      </div>

      {/* Últimos gastos */}
      {recientes.length > 0 && (
        <>
          <div className="home-section-row">
            <span className="home-section-title" style={{margin:0}}>Últimos movimientos</span>
            <button className="home-ver-mas" onClick={()=>onNavTo("gastos")}>Ver todos →</button>
          </div>
          <div className="lista-card" style={{marginBottom:16}}>
            {recientes.map(e=><FilaGasto key={e.id} gasto={e} onClick={()=>{}}/>)}
          </div>
        </>
      )}


      {gastosMes.length===0 && (
        <div className="vacio" style={{paddingTop:20}}>
          <div className="vacio-icon">✨</div>
          <div className="vacio-titulo">Empezá a registrar</div>
          <div className="vacio-sub">Tocá + para agregar tu primer gasto</div>
        </div>
      )}

      <button className="fab" onClick={onAgregar}>+</button>
    </>
  );
}

// ─── Gastos ───────────────────────────────────────────────────────────────────
function GastosTab({ gastos, label, total, vista, diaClose, esActual, onPrev, onNext, onCambiarVista, onAgregar, onEditar }) {
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [texto,       setTexto]       = useState("");
  const [categorias,  setCategorias]  = useState([]);
  const [tipo,        setTipo]        = useState("todos");
  const [montoMin,    setMontoMin]    = useState("");
  const [montoMax,    setMontoMax]    = useState("");
  const [fechaDesde,  setFechaDesde]  = useState("");
  const [fechaHasta,  setFechaHasta]  = useState("");

  function limpiarFiltros() {
    setTexto(""); setCategorias([]); setTipo("todos");
    setMontoMin(""); setMontoMax(""); setFechaDesde(""); setFechaHasta("");
  }
  function toggleCat(id) {
    setCategorias(prev => prev.includes(id) ? prev.filter(c=>c!==id) : [...prev,id]);
  }

  const filtrosActivos = texto || categorias.length>0 || tipo!=="todos" || montoMin || montoMax || fechaDesde || fechaHasta;
  const nFiltros = [texto, categorias.length>0, tipo!=="todos", montoMin||montoMax, fechaDesde||fechaHasta].filter(Boolean).length;

  const gastosFiltrados = gastos.filter(e => {
    if (texto && !(e.description||"").toLowerCase().includes(texto.toLowerCase())) return false;
    if (categorias.length>0 && !categorias.includes(e.category)) return false;
    if (tipo==="fijo"     && !e.is_fixed) return false;
    if (tipo==="variable" &&  e.is_fixed) return false;
    if (montoMin && Number(e.amount) < Number(montoMin)) return false;
    if (montoMax && Number(e.amount) > Number(montoMax)) return false;
    if (fechaDesde && e.date < fechaDesde) return false;
    if (fechaHasta && e.date > fechaHasta) return false;
    return true;
  });
  const totalFiltrado = gastosFiltrados.reduce((s,e)=>s+Number(e.amount),0);

  const grupos = {};
  gastosFiltrados.forEach(e=>{ if(!grupos[e.date]) grupos[e.date]=[]; grupos[e.date].push(e); });
  const fechas = Object.keys(grupos).sort((a,b)=>b.localeCompare(a));

  return (
    <>
      <div className="vista-toggle">
        <button className={`vista-btn${vista==="mes"?" active":""}`} onClick={()=>onCambiarVista("mes")}>Por mes</button>
        <button className={`vista-btn${vista==="cierre"?" active":""}`} onClick={()=>onCambiarVista("cierre")} disabled={!diaClose} title={!diaClose?"Configurá el día de cierre en ⚙️":""}>
          Por cierre {!diaClose&&"⚠️"}
        </button>
      </div>
      <NavPeriod label={label} esActual={esActual} onPrev={onPrev} onNext={onNext}/>

      {/* Barra de búsqueda + toggle filtros */}
      <div className="filter-bar">
        <input className="filter-search" type="text" placeholder="Buscar…"
          value={texto} onChange={e=>setTexto(e.target.value)}/>
        <button className={`filter-toggle-btn${filtrosActivos?" activo":""}`}
          onClick={()=>setFiltrosOpen(o=>!o)}>
          Filtros{nFiltros>0?` (${nFiltros})`:""}
        </button>
      </div>

      {filtrosOpen && (
        <div className="filter-panel">
          <div>
            <div className="filter-section-label">Categoría</div>
            <div className="filter-cats">
              {CATS.map(c=>(
                <button key={c.id} className={`filter-cat-btn${categorias.includes(c.id)?" sel":""}`}
                  onClick={()=>toggleCat(c.id)}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="filter-section-label">Tipo</div>
            <div className="filter-tipo-row">
              {[["todos","Todos"],["fijo","Fijos"],["variable","Variables"]].map(([v,l])=>(
                <button key={v} className={`filter-tipo-btn${tipo===v?" sel":""}`} onClick={()=>setTipo(v)}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="filter-section-label">Monto</div>
            <div className="filter-rango">
              <input type="number" inputMode="numeric" placeholder="Mín $" value={montoMin} onChange={e=>setMontoMin(e.target.value)}/>
              <input type="number" inputMode="numeric" placeholder="Máx $" value={montoMax} onChange={e=>setMontoMax(e.target.value)}/>
            </div>
          </div>
          <div>
            <div className="filter-section-label">Fecha</div>
            <div className="filter-rango">
              <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)}/>
              <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)}/>
            </div>
          </div>
          {filtrosActivos && (
            <button className="btn-limpiar" onClick={limpiarFiltros}>✕ Limpiar todos los filtros</button>
          )}
        </div>
      )}

      <SummaryCard total={totalFiltrado} count={gastosFiltrados.length} labelCount="movimiento"/>
      {fechas.length===0
        ? <Vacio icon="🧾" titulo="Sin gastos" sub={filtrosActivos?"Ningún gasto coincide con los filtros":"Tocá + para agregar"}/>
        : fechas.map(fecha=>(
          <div key={fecha}>
            <div className="fecha-label">{dateLabel(fecha)}</div>
            <div className="lista-card">
              {grupos[fecha].map(e=><FilaGasto key={e.id} gasto={e} onClick={()=>onEditar(e)}/>)}
            </div>
          </div>
        ))
      }
      <button className="fab" onClick={onAgregar}>+</button>
    </>
  );
}

// ─── Fijos ────────────────────────────────────────────────────────────────────
function FijosTab({ fijos, onAgregar, onEditar }) {
  const total = fijos.reduce((s,f)=>s+Number(f.amount),0);
  return (
    <>
      <div className="page-title">Gastos Fijos</div>
      <div className="info-box">Se insertan automáticamente cada mes en Gastos del mes.</div>
      {fijos.length>0 && <SummaryCard total={total} count={fijos.length} labelCount="gasto fijo"/>}
      {fijos.length===0
        ? <Vacio icon="🔁" titulo="Sin gastos fijos" sub="Agregá expensas, suscripciones, gym…"/>
        : <div className="lista-card">{fijos.map(f=><FilaGasto key={f.id} gasto={f} onClick={()=>onEditar(f)} conSigno={false}/>)}</div>
      }
      <button className="btn-outline-add" onClick={onAgregar}>+ Agregar gasto fijo</button>
    </>
  );
}

// ─── Medios ───────────────────────────────────────────────────────────────────
function MediosTab({ gastos, total, label, esActual, onPrev, onNext }) {
  return (
    <>
      <NavPeriod label={label} esActual={esActual} onPrev={onPrev} onNext={onNext}/>
      {MEDIOS.map(medio=>{
        const mg  = gastos.filter(e=>e.card===medio.id);
        const mt  = mg.reduce((s,e)=>s+Number(e.amount),0);
        const pct = total>0?(mt/total)*100:0;
        return (
          <div key={medio.id} className="medio-card">
            <div className="medio-top">
              <div className="medio-nombre-row">
                <span className="medio-icono">{medio.icon}</span>
                <span className="medio-nombre">{medio.name}</span>
              </div>
              <span className="medio-cant">{mg.length} gasto{mg.length!==1?"s":""}</span>
            </div>
            <div className="medio-total" style={{color:medio.color}}>{formatARS(mt)}</div>
            <div className="barra-track" style={{height:6}}>
              <div className="barra-fill" style={{width:`${pct.toFixed(0)}%`,background:medio.color}}/>
            </div>
            {mg.length>0 && (
              <div className="medio-lista">
                {mg.slice(0,5).map(e=>{
                  const cat=getCat(e.category);
                  return (
                    <div key={e.id} className="medio-fila">
                      <span>{cat.icon} {e.description||cat.name}</span>
                      <span style={{fontWeight:700}}>{formatARS(e.amount)}</span>
                    </div>
                  );
                })}
                {mg.length>5 && <div className="medio-mas">+{mg.length-5} más</div>}
              </div>
            )}
          </div>
        );
      })}
      {gastos.length===0 && <Vacio icon="💳" titulo="Sin gastos" sub="Navegá a Gastos del mes para agregar"/>}
    </>
  );
}

// ─── Análisis ─────────────────────────────────────────────────────────────────
function AnalisisTab({ gastos, todosGastos, total, label, sueldo, esActual, onPrev, onNext, onEditarSueldo, dolar, diaClose }) {
  const ahorro    = sueldo - total;
  const pctGasto  = sueldo > 0 ? Math.min(100,(total/sueldo)*100) : 0;
  const pctAhorro = sueldo > 0 ? Math.max(0,(ahorro/sueldo)*100) : 0;
  const porCat    = CATS.map(c=>({...c, total: gastos.filter(e=>e.category===c.id).reduce((s,e)=>s+Number(e.amount),0)})).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  // ── Comparativa 6 meses ──
  const hoy = new Date();
  const ultimos6 = Array.from({length:6},(_,i)=>{
    const d = new Date(hoy.getFullYear(), hoy.getMonth()-5+i, 1);
    const mk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const tot = todosGastos.filter(e=>dateToMonth(e.date)===mk).reduce((s,e)=>s+Number(e.amount),0);
    return { mk, label: d.toLocaleDateString("es-AR",{month:"short"}), total: tot };
  });
  const maxMes = Math.max(...ultimos6.map(m=>m.total), 1);
  const mkActual = currentMonth();

  // ── Análisis inteligente ──
  const ia = [];
  const mesAnteriorMk = (() => { const d=new Date(hoy.getFullYear(),hoy.getMonth()-1,1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; })();
  const totalMesAnt = todosGastos.filter(e=>dateToMonth(e.date)===mesAnteriorMk).reduce((s,e)=>s+Number(e.amount),0);
  if (totalMesAnt > 0 && esActual) {
    const diff = total - totalMesAnt;
    const pct  = Math.abs((diff/totalMesAnt)*100).toFixed(0);
    if (diff > 0) ia.push(`📈 Gastás ${pct}% más que el mes pasado (${formatARS(diff)} adicionales). Revisá en qué categorías subió.`);
    else if (diff < 0) ia.push(`📉 Gastás ${pct}% menos que el mes pasado (${formatARS(Math.abs(diff))} menos). ¡Muy bien!`);
  }
  if (porCat.length > 0) {
    const top = porCat[0];
    ia.push(`${top.icon} Tu mayor gasto es ${top.name}: ${formatARS(top.total)}${sueldo>0?` (${(top.total/sueldo*100).toFixed(0)}% del sueldo)`:""}.`);
  }
  const sal = porCat.find(c=>c.id==="salidas");
  if (sal && sueldo > 0 && sal.total/sueldo > 0.15) ia.push(`🍕 Gastás ${(sal.total/sueldo*100).toFixed(0)}% del sueldo en Salidas. El recomendado es menos del 15%. Considerá un presupuesto semanal.`);
  const sus = porCat.find(c=>c.id==="suscripciones");
  if (sus) ia.push(`📱 ${formatARS(sus.total)} en suscripciones. Hacé una lista de las que usás al menos una vez por semana; cancelá el resto.`);
  const variableTotal = gastos.filter(e=>!e.is_fixed).reduce((s,e)=>s+Number(e.amount),0);
  const fijoTotal     = gastos.filter(e=>e.is_fixed).reduce((s,e)=>s+Number(e.amount),0);
  if (sueldo > 0 && variableTotal > sueldo * 0.4) ia.push(`💡 Tus gastos variables (${formatARS(variableTotal)}) superan el 40% del sueldo. Identificá cuáles podés recortar primero.`);
  if (sueldo > 0 && pctAhorro < 10 && ahorro >= 0) ia.push(`⚠️ Ahorrás el ${pctAhorro.toFixed(0)}% del sueldo. El objetivo recomendado es 20%. Intentá automatizar un depósito a una caja de ahorro al cobrar.`);
  if (sueldo > 0 && ahorro < 0)  ia.push(`🚨 Gastás ${formatARS(Math.abs(ahorro))} más de lo que ganás. Prioridad: reducir gastos variables hasta volver al equilibrio.`);
  if (sueldo > 0 && pctAhorro >= 20) ia.push(`🏆 Ahorrás el ${pctAhorro.toFixed(0)}% del sueldo. Excelente. Considerá invertir el excedente para no perder contra la inflación.`);
  if (sueldo === 0) ia.push("💡 Configurá tu sueldo en ⚙️ para ver el análisis completo personalizado.");

  // ── Análisis tarjeta de crédito ──
  const gastosCred  = gastos.filter(e=>e.card==="credito");
  const totalCred   = gastosCred.reduce((s,e)=>s+Number(e.amount),0);
  const pctCred     = total > 0 ? (totalCred/total*100).toFixed(0) : 0;
  const cuotasPend  = gastosCred.filter(e=>e.cuota_num && e.cuotas && e.cuota_num < e.cuotas);
  const porCatCred  = CATS.map(c=>({...c, total: gastosCred.filter(e=>e.category===c.id).reduce((s,e)=>s+Number(e.amount),0)})).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  return (
    <>
      <NavPeriod label={label} esActual={esActual} onPrev={onPrev} onNext={onNext}/>

      {/* Resumen */}
      <div className="hero-card">
        <div className="hero-label">Resumen del período</div>
        {sueldo>0 ? (
          <>
            <div className="hero-amount" style={{color:ahorro>=0?undefined:"var(--danger)"}}>{ahorro>=0?"+":""}{formatARS(ahorro)}</div>
            <div className="hero-sub">{ahorro>=0?"ahorrado este período":"gastado de más"}</div>
            <div style={{marginTop:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)",marginBottom:6}}>
                <span>{formatARS(total)} ({pctGasto.toFixed(0)}%)</span>
                <span>Sueldo {formatARS(sueldo)}</span>
              </div>
              <div className="barra-track" style={{height:8}}>
                <div className="barra-fill" style={{width:`${pctGasto}%`,background:pctGasto>90?"var(--danger)":pctGasto>70?"var(--warn)":"var(--grad)"}}/>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="hero-amount">{formatARS(total)}</div>
            <div className="hero-sub">total gastado</div>
            <button className="btn-outline-add" style={{marginTop:14}} onClick={onEditarSueldo}>+ Configurar sueldo</button>
          </>
        )}
      </div>

      {sueldo>0 && (
        <div className="stats-row">
          {[
            {label:"Gastado",    val:`${pctGasto.toFixed(0)}%`,  color:"var(--danger)"},
            {label:"Ahorrado",   val:`${pctAhorro.toFixed(0)}%`, color:pctAhorro>=20?"var(--success)":"var(--warn)"},
            {label:"Movimientos",val:gastos.length,              color:"var(--text)"},
          ].map(s=>(
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val" style={{color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Análisis inteligente */}
      {ia.length>0 && (
        <div className="analysis-card">
          <div className="card-titulo">🤖 Análisis inteligente</div>
          {ia.map((t,i)=><div key={i} className="sugerencia">{t}</div>)}
        </div>
      )}

      {/* Comparativa 6 meses */}
      {todosGastos.length>0 && (
        <div className="analysis-card">
          <div className="card-titulo">📊 Comparativa mensual</div>
          <div className="comp-chart">
            {ultimos6.map(m=>(
              <div key={m.mk} className="comp-col">
                <div className="comp-bar-wrap">
                  <div className="comp-bar" style={{
                    height:`${Math.max(4,(m.total/maxMes)*100)}%`,
                    background: m.mk===mkActual ? "var(--grad)" : "rgba(59,130,246,.25)"
                  }}/>
                </div>
                <div className="comp-label" style={{color:m.mk===mkActual?"var(--accent2)":"var(--muted)"}}>{m.label}</div>
                {m.total>0 && <div className="comp-val">{formatARS(m.total).replace("$ ","$")}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dólar */}
      {dolar && (
        <div className="analysis-card">
          <div className="card-titulo">💵 Cotización del dólar (hoy)</div>
          <div className="dolar-row">
            {[["Oficial", dolar.oficial],["MEP", dolar.mep],["Blue", dolar.blue]].map(([n,v])=>(
              <div key={n} className="dolar-item">
                <div className="dolar-nombre">{n}</div>
                <div className="dolar-val">${v ? v.toLocaleString("es-AR") : "–"}</div>
              </div>
            ))}
          </div>
          {dolar.mep && total > 0 && (
            <div style={{marginTop:14,fontSize:13,color:"var(--muted)",borderTop:"1px solid var(--border)",paddingTop:12}}>
              Tus gastos de este período equivalen a{" "}
              <span style={{fontWeight:700,color:"var(--text)"}}>
                USD {(total/dolar.mep).toLocaleString("es-AR",{maximumFractionDigits:0})}
              </span>{" "}al MEP y{" "}
              <span style={{fontWeight:700,color:"var(--text)"}}>
                USD {(total/dolar.blue).toLocaleString("es-AR",{maximumFractionDigits:0})}
              </span>{" "}al blue.
            </div>
          )}
        </div>
      )}

      {/* Tarjeta de crédito */}
      {gastosCred.length>0 && (
        <div className="analysis-card">
          <div className="card-titulo">💳 Tarjeta de crédito — cierre</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontSize:28,fontWeight:800,letterSpacing:-1}}>{formatARS(totalCred)}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{pctCred}% del total del período · {gastosCred.length} movimientos</div>
            </div>
          </div>
          {cuotasPend.length>0 && (
            <div className="cred-alert">
              ⏳ Tenés <strong>{cuotasPend.length}</strong> cuota{cuotasPend.length!==1?"s":""} pendiente{cuotasPend.length!==1?"s":""} que seguirán impactando en próximos cierres.
            </div>
          )}
          {porCatCred.length>0 && (
            <>
              <div className="filter-section-label" style={{marginTop:12}}>Por categoría</div>
              {porCatCred.map(c=>{
                const pct = totalCred>0?(c.total/totalCred*100):0;
                return (
                  <div key={c.id} className="cat-row">
                    <div className="cat-row-top">
                      <span>{c.icon} {c.name}</span>
                      <span style={{fontWeight:700}}>{formatARS(c.total)}</span>
                    </div>
                    <div className="barra-track" style={{marginTop:6}}>
                      <div className="barra-fill" style={{width:`${pct.toFixed(0)}%`,background:c.color}}/>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {sueldo>0 && totalCred/sueldo>0.3 && (
            <div className="sugerencia" style={{marginTop:10,borderTop:"1px solid var(--border)",paddingTop:10}}>
              ⚠️ Usás la tarjeta para el {(totalCred/sueldo*100).toFixed(0)}% del sueldo. El límite recomendado es 30%. Intentá pagar más gastos con débito o efectivo.
            </div>
          )}
        </div>
      )}

      {/* Por categoría */}
      {porCat.length>0 && (
        <div className="analysis-card">
          <div className="card-titulo">Por categoría</div>
          {porCat.map(c=>{
            const pct=total>0?(c.total/total*100):0;
            const ps=sueldo>0?(c.total/sueldo*100).toFixed(0):null;
            return (
              <div key={c.id} className="cat-row">
                <div className="cat-row-top">
                  <span>{c.icon} {c.name}</span>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontWeight:700}}>{formatARS(c.total)}</span>
                    {ps&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>{ps}%</span>}
                  </div>
                </div>
                <div className="barra-track" style={{marginTop:7}}>
                  <div className="barra-fill" style={{width:`${pct.toFixed(0)}%`,background:c.color}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {gastos.length===0 && <Vacio icon="📊" titulo="Sin datos" sub="Agregá gastos para ver el análisis"/>}
    </>
  );
}

// ─── Componentes compartidos ──────────────────────────────────────────────────
function NavPeriod({ label, esActual, onPrev, onNext }) {
  return (
    <div className="nav-mes">
      <button className="flecha-btn" onClick={onPrev}>‹</button>
      <span className="mes-nombre">{label}</span>
      <button className="flecha-btn" onClick={onNext} style={{opacity:esActual?0.3:1}}>›</button>
    </div>
  );
}

function SummaryCard({ total, count, labelCount }) {
  return (
    <div className="hero-card">
      <div className="hero-label">Total del período</div>
      <div className="hero-amount">{formatARS(total)}</div>
      <div className="hero-sub">{count} {labelCount}{count!==1?"s":""}</div>
    </div>
  );
}

function FilaGasto({ gasto:e, onClick, conSigno=true }) {
  const cat   = getCat(e.category);
  const medio = getMedio(e.card);
  return (
    <div className="fila-gasto" onClick={onClick}>
      <div className="fila-icon" style={{background:cat.color+"1a"}}>{cat.icon}</div>
      <div className="fila-info">
        <div className="fila-nombre">{e.description || cat.name}</div>
        <div className="fila-meta">
          <span className="fila-medio" style={{color:medio.color}}>{medio.icon} {medio.name}</span>
          {e.is_fixed && <span className="chip-fijo">FIJO</span>}
          {e.cuota_num && e.cuotas && <span className="chip-cuota">{e.cuota_num}/{e.cuotas}</span>}
          {e.tags && e.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=>(
            <span key={t} className="chip-tag">{t}</span>
          ))}
        </div>
      </div>
      <div className="fila-monto" style={{color:cat.color}}>{conSigno?"-":""}{formatARS(e.amount)}</div>
    </div>
  );
}

// ─── Metas de ahorro ─────────────────────────────────────────────────────────
function MetasTab({ metas, contribuciones, saving, onNuevaMeta, onEditarMeta, onEliminarMeta, onAgregarAporte, onEliminarAporte }) {
  return (
    <>
      <div className="page-title">Metas de ahorro</div>
      {metas.length === 0
        ? <Vacio icon="🎯" titulo="Sin metas" sub="Tocá + para crear tu primera meta"/>
        : metas.map(meta => {
          const aportado = contribuciones.filter(c=>c.goal_id===meta.id).reduce((s,c)=>s+Number(c.amount),0);
          const pct = meta.target_amount > 0 ? Math.min(100,(aportado/meta.target_amount)*100) : 0;
          const contribs = contribuciones.filter(c=>c.goal_id===meta.id);
          const cumplida = aportado >= Number(meta.target_amount);
          return (
            <div key={meta.id} className="meta-card">
              <div className="meta-header">
                <div style={{flex:1,minWidth:0}}>
                  <div className="meta-nombre">{cumplida?"✅ ":""}{meta.name}</div>
                  {meta.target_date && (
                    <div className="meta-fecha">
                      Objetivo: {new Date(meta.target_date+"T12:00:00").toLocaleDateString("es-AR",{day:"numeric",month:"long",year:"numeric"})}
                    </div>
                  )}
                </div>
                <button className="icon-btn-sm" onClick={()=>onEditarMeta(meta)}>✏️</button>
              </div>
              <div className="meta-progress-label">
                <span style={{fontWeight:800,fontSize:20}}>{formatARS(aportado)}</span>
                <span className="meta-de-label"> de {formatARS(meta.target_amount)}</span>
                <span className="meta-pct">{pct.toFixed(0)}%</span>
              </div>
              <div className="barra-track" style={{height:10,marginTop:10,marginBottom:4}}>
                <div className="barra-fill" style={{width:`${pct}%`,background:cumplida?"var(--success)":pct>=70?"var(--warn)":"var(--grad)"}}/>
              </div>
              {contribs.length > 0 && (
                <div className="meta-contribs">
                  {contribs.map(c=>(
                    <div key={c.id} className="meta-contrib-fila">
                      <span className="meta-contrib-fecha">{dateLabel(c.date)}</span>
                      {c.note && <span className="meta-contrib-nota">{c.note}</span>}
                      <span className="meta-contrib-monto">+{formatARS(c.amount)}</span>
                      <button className="meta-contrib-del" onClick={()=>onEliminarAporte(c.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-aporte" onClick={()=>onAgregarAporte(meta)} disabled={saving}>
                + Agregar aporte
              </button>
            </div>
          );
        })
      }
      <button className="fab" onClick={onNuevaMeta}>+</button>
    </>
  );
}

function Vacio({ icon, titulo, sub }) {
  return (
    <div className="vacio">
      <div className="vacio-icon">{icon}</div>
      <div className="vacio-titulo">{titulo}</div>
      <div className="vacio-sub">{sub}</div>
    </div>
  );
}

function Splash() {
  return (
    <div className="splash">
      <div style={{fontSize:52}}>💸</div>
      <div style={{fontSize:22,fontWeight:700,letterSpacing:"-.5px"}}>Mis Gastos</div>
      <div style={{fontSize:13,color:"#6b7aa0",marginTop:4}}>Cargando…</div>
    </div>
  );
}

// ─── Modales ──────────────────────────────────────────────────────────────────
function GastoModal({ gasto, saving, onGuardar, onEliminar, onCerrar }) {
  const [form, setForm] = useState({
    description: gasto?.description || "",
    amount:      gasto?.amount ? String(gasto.amount) : "",
    category:    gasto?.category || CATS[0].id,
    card:        gasto?.card     || MEDIOS[0].id,
    date:        gasto?.date     || todayStr(),
    cuotas:      1,
    tags:        gasto?.tags     || "",
  });
  const set     = (k,v) => setForm(f=>({...f,[k]:v}));
  const numStr  = form.amount.replace(/\D/g,"");
  const display = numStr ? new Intl.NumberFormat("es-AR").format(Number(numStr)) : "";
  const mostrarCuotas = !gasto && form.card === "credito";

  return (
    <Modal titulo={gasto?"Editar gasto":"Nuevo gasto"} onCerrar={onCerrar}>
      <Campo label="Monto">
        <input className="input-monto" type="text" inputMode="numeric" placeholder="$ 0"
          value={display?`$ ${display}`:""}
          onChange={e=>set("amount",e.target.value.replace(/\D/g,""))}/>
      </Campo>
      <Campo label="Descripción">
        <input type="text" placeholder="Ej: Almuerzo, nafta…"
          value={form.description} onChange={e=>set("description",e.target.value)}/>
      </Campo>
      <Campo label="Categoría"><PickerCategoria value={form.category} onChange={v=>set("category",v)}/></Campo>
      <Campo label="Medio de pago"><PickerMedio value={form.card} onChange={v=>set("card",v)}/></Campo>
      {mostrarCuotas && (
        <Campo label="Cuotas">
          <PickerCuotas value={form.cuotas} onChange={v=>set("cuotas",v)}/>
        </Campo>
      )}
      <Campo label="Fecha">
        <input type="date" value={form.date} onChange={e=>set("date",e.target.value)}/>
      </Campo>
      <Campo label="Etiquetas (opcional)">
        <input type="text" placeholder="Ej: viaje, regalo, trabajo  (separadas por coma)"
          value={form.tags} onChange={e=>set("tags",e.target.value)}/>
      </Campo>
      <button className="btn-primario" disabled={!numStr||saving} onClick={()=>onGuardar({...form,amount:numStr})}>
        {saving?"Guardando…":gasto?"Guardar cambios":"Agregar gasto"}
      </button>
      {onEliminar && <button className="btn-peligro" onClick={onEliminar} disabled={saving}>Eliminar gasto</button>}
    </Modal>
  );
}

function FijoModal({ fijo, saving, onGuardar, onEliminar, onCerrar }) {
  const [form, setForm] = useState({
    description:     fijo?.description || "",
    amount:          fijo?.amount ? String(fijo.amount) : "",
    category:        fijo?.category || CATS[0].id,
    card:            fijo?.card     || MEDIOS[0].id,
    dia_recurrencia: fijo?.dia_recurrencia ? String(fijo.dia_recurrencia) : "",
    activo:          fijo?.activo !== false,
  });
  const set     = (k,v) => setForm(f=>({...f,[k]:v}));
  const numStr  = form.amount.replace(/\D/g,"");
  const display = numStr ? new Intl.NumberFormat("es-AR").format(Number(numStr)) : "";

  return (
    <Modal titulo={fijo?"Editar gasto fijo":"Nuevo gasto fijo"} onCerrar={onCerrar}>
      <Campo label="Monto">
        <input className="input-monto" type="text" inputMode="numeric" placeholder="$ 0"
          value={display?`$ ${display}`:""}
          onChange={e=>set("amount",e.target.value.replace(/\D/g,""))}/>
      </Campo>
      <Campo label="Descripción">
        <input type="text" placeholder="Ej: Expensas, Netflix, Gym…"
          value={form.description} onChange={e=>set("description",e.target.value)}/>
      </Campo>
      <Campo label="Categoría"><PickerCategoria value={form.category} onChange={v=>set("category",v)}/></Campo>
      <Campo label="Medio de pago"><PickerMedio value={form.card} onChange={v=>set("card",v)}/></Campo>
      <Campo label="Día del mes en que se genera">
        <input type="number" inputMode="numeric" placeholder="Ej: 1  (vacío = día 1)"
          min="1" max="31" value={form.dia_recurrencia} onChange={e=>set("dia_recurrencia",e.target.value)}/>
        <div style={{fontSize:11,color:"var(--muted)",marginTop:6,lineHeight:1.6}}>
          Cada mes se crea automáticamente en este día. Si no abriste la app, se genera retroactivamente.
        </div>
      </Campo>
      {fijo && (
        <Campo label="Estado de la recurrencia">
          <div className="toggle-row">
            <span style={{fontSize:14,fontWeight:600,color:form.activo?"var(--success)":"var(--muted)"}}>
              {form.activo ? "Activo — genera cada mes" : "Pausado — no se genera"}
            </span>
            <button className={`toggle-pill${form.activo?" on":""}`} onClick={()=>set("activo",!form.activo)}>
              <span className="toggle-knob"/>
            </button>
          </div>
        </Campo>
      )}
      <button className="btn-primario" disabled={!numStr||saving} onClick={()=>onGuardar({...form,amount:numStr})}>
        {saving?"Guardando…":fijo?"Guardar cambios":"Agregar gasto fijo"}
      </button>
      {onEliminar && <button className="btn-peligro" onClick={onEliminar} disabled={saving}>Eliminar</button>}
    </Modal>
  );
}

function MetaModal({ meta, saving, onGuardar, onEliminar, onCerrar }) {
  const [form, setForm] = useState({
    name:          meta?.name || "",
    target_amount: meta?.target_amount ? String(meta.target_amount) : "",
    target_date:   meta?.target_date || "",
  });
  const set    = (k,v) => setForm(f=>({...f,[k]:v}));
  const numStr = form.target_amount.replace(/\D/g,"");
  const display= numStr ? new Intl.NumberFormat("es-AR").format(Number(numStr)) : "";

  return (
    <Modal titulo={meta?"Editar meta":"Nueva meta de ahorro"} onCerrar={onCerrar}>
      <Campo label="Nombre de la meta">
        <input type="text" placeholder="Ej: Viaje a Europa, Fondo de emergencia…"
          value={form.name} onChange={e=>set("name",e.target.value)}/>
      </Campo>
      <Campo label="Monto objetivo">
        <input className="input-monto" type="text" inputMode="numeric" placeholder="$ 0"
          value={display?`$ ${display}`:""}
          onChange={e=>set("target_amount",e.target.value.replace(/\D/g,""))}/>
      </Campo>
      <Campo label="Fecha objetivo (opcional)">
        <input type="date" value={form.target_date} onChange={e=>set("target_date",e.target.value)}/>
      </Campo>
      <button className="btn-primario" disabled={!form.name||!numStr||saving}
        onClick={()=>onGuardar({...form,target_amount:numStr})}>
        {saving?"Guardando…":meta?"Guardar cambios":"Crear meta"}
      </button>
      {onEliminar && <button className="btn-peligro" onClick={onEliminar} disabled={saving}>Eliminar meta</button>}
    </Modal>
  );
}

function ContribucionModal({ meta, saving, onGuardar, onCerrar }) {
  const [form, setForm] = useState({ amount:"", date:todayStr(), note:"" });
  const set    = (k,v) => setForm(f=>({...f,[k]:v}));
  const numStr = form.amount.replace(/\D/g,"");
  const display= numStr ? new Intl.NumberFormat("es-AR").format(Number(numStr)) : "";

  return (
    <Modal titulo={`Aporte a "${meta?.name}"`} onCerrar={onCerrar}>
      <Campo label="Monto del aporte">
        <input className="input-monto" type="text" inputMode="numeric" placeholder="$ 0"
          value={display?`$ ${display}`:""}
          onChange={e=>set("amount",e.target.value.replace(/\D/g,""))}/>
      </Campo>
      <Campo label="Fecha">
        <input type="date" value={form.date} onChange={e=>set("date",e.target.value)}/>
      </Campo>
      <Campo label="Nota (opcional)">
        <input type="text" placeholder="Ej: Bonus, ahorro del mes…"
          value={form.note} onChange={e=>set("note",e.target.value)}/>
      </Campo>
      <button className="btn-primario" disabled={!numStr||saving}
        onClick={()=>onGuardar({...form,amount:numStr,goal_id:meta.id})}>
        {saving?"Guardando…":"Agregar aporte"}
      </button>
    </Modal>
  );
}

function SettingsModal({ settings, onGuardar, onCerrar }) {
  const [sueldo,   setSueldo]   = useState(settings.sueldo   || "");
  const [diaClose, setDiaClose] = useState(settings.diaClose || "");
  function guardar() { onGuardar({sueldo:Number(sueldo)||0, diaClose:Number(diaClose)||null}); onCerrar(); }
  return (
    <Modal titulo="Configuración" onCerrar={onCerrar}>
      <Campo label="Mi sueldo mensual">
        <input type="number" inputMode="numeric" placeholder="Ej: 500000"
          value={sueldo} onChange={e=>setSueldo(e.target.value)}/>
      </Campo>
      <Campo label="Día de cierre de tarjeta">
        <input type="number" inputMode="numeric" placeholder="Ej: 15  (vacío si no aplica)"
          min="1" max="31" value={diaClose} onChange={e=>setDiaClose(e.target.value)}/>
        <div style={{fontSize:11,color:"var(--muted)",marginTop:6,lineHeight:1.6}}>
          Permite ver los gastos por período de tarjeta en lugar de mes calendario.
        </div>
      </Campo>
      <button className="btn-primario" onClick={guardar}>Guardar</button>
    </Modal>
  );
}

function Modal({ titulo, onCerrar, children }) {
  return (
    <div className="overlay" onClick={onCerrar}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div className="sheet-header">
          <span className="sheet-titulo">{titulo}</span>
          <button className="sheet-cerrar" onClick={onCerrar}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Campo({ label, children }) {
  return <div className="campo"><label className="campo-label">{label}</label>{children}</div>;
}
function PickerCategoria({ value, onChange }) {
  return (
    <div className="cat-grid">
      {CATS.map(c=>(
        <button key={c.id} className={`cat-btn${value===c.id?" sel":""}`}
          style={value===c.id?{"--cc":c.color}:{}}
          onClick={()=>onChange(c.id)}>
          <span style={{fontSize:24}}>{c.icon}</span>
          <span className="cat-btn-label">{c.name}</span>
        </button>
      ))}
    </div>
  );
}
const CUOTAS_OPTS = [1, 2, 3, 6, 9, 12, 18, 24];
function PickerCuotas({ value, onChange }) {
  return (
    <div className="cuotas-picker">
      {CUOTAS_OPTS.map(n=>(
        <button key={n} className={`cuotas-opt${value===n?" sel":""}`} onClick={()=>onChange(n)}>
          {n===1?"Sin cuotas":`${n}x`}
        </button>
      ))}
    </div>
  );
}

function PickerMedio({ value, onChange }) {
  return (
    <div className="medio-picker">
      {MEDIOS.map(m=>(
        <button key={m.id} className={`medio-opt${value===m.id?" sel":""}`}
          style={value===m.id?{background:m.color,borderColor:m.color,color:"#fff"}:{}}
          onClick={()=>onChange(m.id)}>
          <span>{m.icon}</span><span>{m.name}</span>
        </button>
      ))}
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  * { -webkit-tap-highlight-color:transparent; }
  :root {
    --bg:#070b12; --card:#0e1522; --card2:#141e30;
    --border:rgba(59,130,246,.14); --accent:#3b82f6; --accent2:#93c5fd;
    --grad:linear-gradient(135deg,#3b82f6,#6366f1);
    --text:#eef2ff; --muted:#5d6e92; --danger:#f43f5e;
    --success:#34d399; --warn:#fbbf24;
    --r:20px; --r-sm:14px; --r-xs:10px;
    --drawer-w:285px;
  }
  html,body { height:100dvh; overflow:hidden; overscroll-behavior:none; background:var(--bg); }
  body { color:var(--text); font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; font-size:15px; line-height:1.5; }
  button { cursor:pointer; border:none; background:none; color:inherit; font:inherit; }
  input,textarea { font:inherit; color:inherit; background:none; border:none; outline:none; }

  /* ── Layout ── */
  .app { display:flex; flex-direction:row; height:100dvh; width:100%; }
  .main-col { flex:1; min-width:0; display:flex; flex-direction:column; height:100dvh; }

  /* ── Top bar ── */
  .topbar { flex-shrink:0; display:flex; align-items:center; justify-content:space-between; padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 12px; gap:8px; transition:background .3s; position:relative; z-index:10; }
  .topbar-home { background:transparent; }
  .brand { display:flex; align-items:center; gap:8px; flex:1; justify-content:center; }
  .logo  { width:32px; height:32px; border-radius:10px; background:var(--grad); display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .app-name { font-size:18px; font-weight:700; letter-spacing:-.4px; }
  .saving-txt { font-size:11px; color:var(--muted); }
  .icon-btn { width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.07); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .icon-btn:active { opacity:.6; }

  /* ── Hamburger — solo en mobile ── */
  .ham-btn { width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.07); border:1px solid var(--border); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; flex-shrink:0; }
  .ham-btn span { display:block; width:18px; height:2px; background:var(--text); border-radius:99px; }
  .ham-btn:active { opacity:.6; }

  /* ── Drawer / Sidebar ── */
  .drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0); pointer-events:none; transition:background .3s; z-index:200; }
  .drawer-overlay.open { background:rgba(0,0,0,.7); pointer-events:auto; backdrop-filter:blur(6px); }
  /* Mobile: drawer deslizable */
  .drawer { position:fixed; top:0; left:0; bottom:0; width:var(--drawer-w); background:#09101d; border-right:1px solid rgba(59,130,246,.12); z-index:210; transform:translateX(-100%); transition:transform .3s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
  .drawer.open { transform:translateX(0); }
  .drawer-header { display:flex; align-items:center; gap:14px; padding:56px 22px 24px; background:linear-gradient(160deg,rgba(59,130,246,.13),rgba(99,102,241,.06)); border-bottom:1px solid rgba(59,130,246,.1); }
  .drawer-logo-wrap { width:50px; height:50px; border-radius:16px; background:var(--grad); display:flex; align-items:center; justify-content:center; font-size:26px; flex-shrink:0; box-shadow:0 6px 24px rgba(59,130,246,.3); }
  .drawer-app-name { font-size:18px; font-weight:700; letter-spacing:-.3px; }
  .drawer-tagline  { font-size:12px; color:var(--muted); margin-top:1px; }
  .drawer-nav { flex:1; padding:14px 10px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
  .drawer-item { display:flex; align-items:center; gap:13px; padding:13px 14px; border-radius:13px; font-size:14.5px; font-weight:500; color:var(--muted); position:relative; text-align:left; transition:all .15s; }
  .drawer-item:active { opacity:.7; }
  .drawer-item.active { color:var(--text); background:rgba(59,130,246,.11); font-weight:600; }
  .drawer-icon { font-size:20px; width:26px; text-align:center; flex-shrink:0; }
  .drawer-pip { position:absolute; right:12px; width:6px; height:6px; border-radius:50%; background:var(--accent); }
  .drawer-footer { padding:14px 10px calc(env(safe-area-inset-bottom,0px)+14px); border-top:1px solid rgba(59,130,246,.08); }
  .drawer-cfg { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:13px; font-size:14px; color:var(--muted); width:100%; }
  .drawer-cfg:active { background:var(--card2); }

  /* Desktop: sidebar fijo siempre visible */
  @media (min-width:768px) {
    .drawer { position:relative; transform:none !important; width:260px; flex-shrink:0; height:100dvh; z-index:auto; }
    .drawer-header { padding-top:32px; }
    .drawer-overlay { display:none !important; }
    .ham-btn { display:none; }
    .brand { justify-content:flex-start; }
  }

  /* ── Content ── */
  .content { flex:1; min-height:0; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; padding:0 24px calc(40px + env(safe-area-inset-bottom,0px)); }
  @media (min-width:768px) {
    .content { padding:0 40px 48px; max-width:860px; }
  }

  /* ── Home ── */
  .home-hero { margin:0 -16px 0; padding:0 24px 28px; background:linear-gradient(175deg,#111827 0%,#0f1c3d 40%,#070b12 100%); position:relative; overflow:hidden; }
  .home-hero-glow { position:absolute; top:-60px; left:50%; transform:translateX(-50%); width:340px; height:340px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,.25) 0%,transparent 70%); pointer-events:none; }
  .home-top-row { display:flex; align-items:flex-start; gap:16px; margin-top:16px; margin-bottom:24px; }
  .home-saludo-col { display:flex; flex-direction:column; align-items:center; gap:6px; flex-shrink:0; padding-top:4px; }
  .home-icono-saludo { font-size:28px; }
  .home-saludo { font-size:12px; font-weight:600; color:rgba(255,255,255,.5); text-align:center; writing-mode:initial; }
  .home-frase-col { flex:1; min-width:0; border-left:2px solid rgba(99,102,241,.35); padding-left:14px; }
  .home-frase-comilla { font-size:32px; line-height:.6; color:rgba(99,102,241,.4); font-family:Georgia,serif; font-weight:900; margin-bottom:6px; }
  .home-frase-texto { font-size:15px; font-weight:600; line-height:1.55; color:#fff; font-style:italic; margin-bottom:8px; }
  .home-frase-autor { font-size:11px; font-weight:700; color:rgba(147,197,253,.65); letter-spacing:.2px; }
  .home-mes-card { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:18px; padding:18px 20px; backdrop-filter:blur(10px); }
  .home-mes-label { font-size:11px; font-weight:600; color:rgba(255,255,255,.45); text-transform:uppercase; letter-spacing:.7px; margin-bottom:4px; text-transform:capitalize; }
  .home-mes-total { font-size:38px; font-weight:800; letter-spacing:-1.5px; color:#fff; line-height:1.1; }
  .home-mes-ahorro { font-size:13px; font-weight:600; margin-top:6px; }
  .ahorro-pos { color:#34d399; }
  .ahorro-neg { color:#f43f5e; }
  .home-barra-wrap { margin-top:14px; }
  .home-barra-track { height:5px; background:rgba(255,255,255,.12); border-radius:99px; overflow:hidden; margin-bottom:7px; }
  .home-barra-fill  { height:100%; border-radius:99px; transition:width .6s; }
  .home-barra-pct   { font-size:11px; color:rgba(255,255,255,.4); }

  .home-section-title { font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.6px; margin:20px 0 10px; }
  .home-section-row   { display:flex; justify-content:space-between; align-items:center; margin:16px 0 8px; }
  .home-ver-mas { font-size:13px; color:var(--accent2); font-weight:600; }

  /* Shortcuts */
  .shortcuts-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:6px; }
  .shortcut { display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px 4px 14px; border-radius:16px; background:var(--card); border:1px solid var(--border); transition:background .15s; }
  .shortcut:active { background:var(--card2); }
  .shortcut-icon-wrap { width:44px; height:44px; border-radius:14px; background:color-mix(in srgb,var(--sc) 15%,transparent); border:1px solid color-mix(in srgb,var(--sc) 25%,transparent); display:flex; align-items:center; justify-content:center; font-size:22px; }
  .shortcut-label { font-size:11px; font-weight:600; color:var(--muted); text-align:center; }

  /* Stats */
  .home-stats { display:flex; align-items:center; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:14px 16px; margin:14px 0 20px; }
  .home-stat  { flex:1; text-align:center; }
  .home-stat-val { display:block; font-size:16px; font-weight:800; letter-spacing:-.5px; }
  .home-stat-label { display:block; font-size:10px; color:var(--muted); margin-top:2px; }
  .home-stat-div { width:1px; height:30px; background:var(--border); }


  /* ── Nav período ── */
  .nav-mes    { display:flex; align-items:center; justify-content:space-between; padding:12px 0 14px; }
  .flecha-btn { width:44px; height:44px; border-radius:50%; background:var(--card); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:22px; }
  .flecha-btn:active { opacity:.6; }
  .mes-nombre { font-size:16px; font-weight:700; letter-spacing:-.4px; text-transform:capitalize; text-align:center; }

  /* ── Toggle vista ── */
  .vista-toggle { display:flex; background:var(--card); border:1px solid var(--border); border-radius:99px; padding:3px; gap:2px; margin:12px 0 4px; }
  .vista-btn { flex:1; padding:8px; border-radius:99px; font-size:12px; font-weight:600; color:var(--muted); transition:all .2s; }
  .vista-btn.active { background:var(--grad); color:#fff; }
  .vista-btn:disabled { opacity:.4; cursor:default; }

  /* ── Hero card ── */
  .hero-card  { background:linear-gradient(135deg,rgba(59,130,246,.09),rgba(99,102,241,.09)); border:1px solid rgba(59,130,246,.2); border-radius:var(--r); padding:22px; margin-bottom:16px; }
  .hero-label { font-size:11px; font-weight:700; color:var(--accent2); text-transform:uppercase; letter-spacing:.7px; margin-bottom:7px; }
  .hero-amount{ font-size:38px; font-weight:800; letter-spacing:-1.5px; background:var(--grad); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; }
  .hero-sub   { font-size:12px; color:var(--muted); margin-top:7px; }

  /* ── Lista gastos ── */
  .fecha-label { font-size:12px; font-weight:700; color:var(--muted); text-transform:capitalize; padding:14px 2px 7px; }
  .lista-card  { background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); overflow:hidden; margin-bottom:8px; }
  .fila-gasto  { display:flex; align-items:center; gap:13px; padding:14px 16px; border-bottom:1px solid rgba(59,130,246,.06); cursor:pointer; transition:background .12s; }
  .fila-gasto:last-child { border-bottom:none; }
  .fila-gasto:active { background:var(--card2); }
  .fila-icon   { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:21px; flex-shrink:0; }
  .fila-info   { flex:1; min-width:0; }
  .fila-nombre { font-weight:500; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:1px; }
  .fila-meta   { font-size:11.5px; display:flex; gap:6px; align-items:center; }
  .fila-medio  { font-weight:600; }
  .fila-monto  { font-weight:700; font-size:15px; flex-shrink:0; letter-spacing:-.3px; }
  .chip-fijo   { font-size:9px; padding:2px 6px; border-radius:99px; font-weight:700; background:rgba(59,130,246,.18); color:var(--accent2); }
  .chip-cuota  { font-size:9px; padding:2px 6px; border-radius:99px; font-weight:700; background:rgba(245,158,11,.18); color:#fbbf24; }
  .chip-tag    { font-size:9px; padding:2px 7px; border-radius:99px; font-weight:600; background:rgba(99,102,241,.18); color:#a5b4fc; }

  /* ── Comparativa mensual ── */
  .comp-chart  { display:flex; align-items:flex-end; gap:6px; height:120px; padding-top:8px; }
  .comp-col    { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; }
  .comp-bar-wrap { flex:1; width:100%; display:flex; align-items:flex-end; }
  .comp-bar    { width:100%; border-radius:6px 6px 0 0; min-height:4px; transition:height .4s; }
  .comp-label  { font-size:10px; font-weight:600; text-transform:capitalize; }
  .comp-val    { font-size:8px; color:var(--muted); text-align:center; white-space:nowrap; }

  /* ── Dólar ── */
  .dolar-row   { display:flex; gap:8px; }
  .dolar-item  { flex:1; background:var(--card2); border-radius:var(--r-xs); padding:12px 8px; text-align:center; }
  .dolar-nombre{ font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
  .dolar-val   { font-size:16px; font-weight:800; color:var(--success); }

  /* ── Crédito alert ── */
  .cred-alert  { background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.2); border-radius:var(--r-xs); padding:10px 14px; font-size:13px; color:#fbbf24; margin:10px 0; line-height:1.6; }
  .cuotas-picker { display:flex; flex-wrap:wrap; gap:7px; }
  .cuotas-opt  { padding:8px 14px; border-radius:99px; font-size:13px; font-weight:600; border:1.5px solid var(--border); background:var(--card2); color:var(--muted); transition:all .15s; }
  .cuotas-opt.sel { background:var(--grad); border-color:transparent; color:#fff; }
  .cuotas-opt:active { opacity:.7; }

  /* ── FAB ── */
  .fab { position:fixed; bottom:calc(24px + env(safe-area-inset-bottom,0px)); right:20px; width:58px; height:58px; border-radius:50%; background:var(--grad); font-size:28px; color:#fff; box-shadow:0 6px 28px rgba(59,130,246,.5); z-index:9; display:flex; align-items:center; justify-content:center; }
  @media (min-width:481px) { .fab { right:calc(50% - 224px); } }
  .fab:active { transform:scale(.9); }

  /* ── Fijos ── */
  .page-title { font-size:24px; font-weight:800; letter-spacing:-.6px; padding:12px 0 10px; }
  .info-box { background:rgba(59,130,246,.06); border:1px solid rgba(59,130,246,.12); border-radius:var(--r-xs); padding:12px 16px; font-size:13px; color:var(--muted); line-height:1.6; margin-bottom:14px; }
  .btn-outline-add { width:100%; padding:15px; border-radius:var(--r-sm); font-weight:700; font-size:15px; background:var(--grad); color:#fff; margin-top:12px; display:block; }
  .btn-outline-add:active { opacity:.85; }

  /* ── Medios ── */
  .medio-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:20px; margin-bottom:10px; }
  .medio-top  { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .medio-nombre-row { display:flex; align-items:center; gap:8px; }
  .medio-icono { font-size:20px; }
  .medio-nombre{ font-size:17px; font-weight:700; }
  .medio-cant  { font-size:12px; color:var(--muted); }
  .medio-total { font-size:32px; font-weight:800; letter-spacing:-1px; margin:8px 0 12px; }
  .barra-track { height:4px; background:var(--card2); border-radius:99px; overflow:hidden; }
  .barra-fill  { height:100%; border-radius:99px; transition:width .5s; }
  .medio-lista { border-top:1px solid var(--border); padding-top:12px; margin-top:12px; display:flex; flex-direction:column; gap:9px; }
  .medio-fila  { display:flex; justify-content:space-between; font-size:13px; color:var(--muted); }
  .medio-mas   { font-size:12px; color:var(--muted); text-align:center; padding-top:4px; }

  /* ── Análisis ── */
  .stats-row { display:flex; gap:8px; margin-bottom:12px; }
  .stat-card  { flex:1; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:14px 10px; text-align:center; }
  .stat-label { font-size:10px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .stat-val   { font-size:22px; font-weight:800; letter-spacing:-1px; }
  .analysis-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:18px; margin-bottom:12px; }
  .card-titulo{ font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.6px; margin-bottom:14px; }
  .sugerencia { font-size:13px; line-height:1.7; padding:10px 0; border-bottom:1px solid rgba(59,130,246,.07); }
  .sugerencia:last-child { border-bottom:none; padding-bottom:0; }
  .cat-row    { padding:11px 0; border-bottom:1px solid rgba(59,130,246,.06); }
  .cat-row:last-child { border-bottom:none; }
  .cat-row-top { display:flex; justify-content:space-between; align-items:center; font-size:14px; }

  /* ── Vacío ── */
  .vacio { text-align:center; padding:56px 20px; color:var(--muted); }
  .vacio-icon { font-size:52px; margin-bottom:14px; opacity:.55; }
  .vacio-titulo { font-size:17px; font-weight:600; color:var(--text); margin-bottom:6px; }
  .vacio-sub { font-size:13px; }

  /* ── Splash ── */
  .splash { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100dvh; background:var(--bg); gap:12px; }

  /* ── Overlay / Sheet ── */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.8); z-index:300; display:flex; align-items:flex-end; justify-content:center; backdrop-filter:blur(8px); }
  .sheet { background:#0e1522; border-radius:26px 26px 0 0; border-top:1px solid var(--border); width:100%; max-width:480px; padding:0 20px calc(28px + env(safe-area-inset-bottom,0px)); max-height:92dvh; overflow-y:auto; }
  .sheet-handle { width:36px; height:4px; background:rgba(255,255,255,.12); border-radius:99px; margin:14px auto 20px; }
  .sheet-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }
  .sheet-titulo { font-size:20px; font-weight:700; letter-spacing:-.4px; }
  .sheet-cerrar { width:30px; height:30px; border-radius:50%; background:var(--card2); display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--muted); }

  /* ── Campos ── */
  .campo { margin-bottom:18px; }
  .campo-label { display:block; font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.6px; margin-bottom:8px; }
  .campo input,.campo textarea { width:100%; background:var(--card2); border:1.5px solid rgba(59,130,246,.12); border-radius:var(--r-sm); padding:13px 15px; font-size:15px; color:var(--text); transition:border-color .15s; }
  .campo input:focus,.campo textarea:focus { border-color:var(--accent); }
  .input-monto { font-size:30px !important; font-weight:800 !important; letter-spacing:-1px !important; }

  /* ── Botones ── */
  .btn-primario { width:100%; padding:16px; border-radius:var(--r-sm); font-weight:700; font-size:15px; background:var(--grad); color:#fff; margin-top:4px; letter-spacing:-.2px; }
  .btn-primario:active { opacity:.85; }
  .btn-primario:disabled { opacity:.35; cursor:default; }
  .btn-peligro  { width:100%; padding:14px; border-radius:var(--r-sm); font-weight:700; font-size:14px; background:rgba(244,63,94,.08); color:var(--danger); border:1.5px solid rgba(244,63,94,.18); margin-top:10px; }
  .btn-peligro:active { opacity:.7; }

  /* ── Picker categoría ── */
  .cat-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:7px; }
  .cat-btn  { display:flex; flex-direction:column; align-items:center; gap:5px; padding:10px 2px 9px; border-radius:13px; border:1.5px solid transparent; background:var(--card2); transition:all .15s; }
  .cat-btn.sel { background:color-mix(in srgb,var(--cc) 14%,transparent); border-color:color-mix(in srgb,var(--cc) 40%,transparent); }
  .cat-btn:active { opacity:.7; }
  .cat-btn-label { font-size:9px; font-weight:600; color:var(--muted); text-align:center; line-height:1.2; }
  .cat-btn.sel .cat-btn-label { color:var(--cc); }

  /* ── Toggle pill ── */
  .toggle-row  { display:flex; justify-content:space-between; align-items:center; padding:4px 0; }
  .toggle-pill { width:48px; height:26px; border-radius:99px; background:rgba(255,255,255,.12); position:relative; transition:background .2s; flex-shrink:0; }
  .toggle-pill.on { background:var(--accent); }
  .toggle-knob { position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition:transform .2s; display:block; box-shadow:0 1px 4px rgba(0,0,0,.3); }
  .toggle-pill.on .toggle-knob { transform:translateX(22px); }

  /* ── Filtros ── */
  .filter-bar         { display:flex; gap:8px; margin-bottom:8px; }
  .filter-search      { flex:1; background:var(--card); border:1.5px solid var(--border); border-radius:99px; padding:10px 16px; font-size:14px; color:var(--text); }
  .filter-search:focus{ border-color:var(--accent); outline:none; }
  .filter-toggle-btn  { flex-shrink:0; padding:10px 16px; border-radius:99px; font-size:13px; font-weight:600; background:var(--card); border:1.5px solid var(--border); color:var(--muted); }
  .filter-toggle-btn.activo { border-color:var(--accent); color:var(--accent2); background:rgba(59,130,246,.1); }
  .filter-toggle-btn:active { opacity:.7; }
  .filter-panel       { background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:16px; margin-bottom:10px; display:flex; flex-direction:column; gap:14px; }
  .filter-section-label { font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.6px; margin-bottom:6px; }
  .filter-cats        { display:flex; flex-wrap:wrap; gap:6px; }
  .filter-cat-btn     { padding:5px 11px; border-radius:99px; font-size:12px; font-weight:600; border:1.5px solid var(--border); background:var(--card2); color:var(--muted); }
  .filter-cat-btn.sel { border-color:var(--accent); color:var(--accent2); background:rgba(59,130,246,.12); }
  .filter-cat-btn:active { opacity:.7; }
  .filter-tipo-row    { display:flex; gap:6px; }
  .filter-tipo-btn    { flex:1; padding:9px 4px; border-radius:99px; font-size:13px; font-weight:600; border:1.5px solid var(--border); background:var(--card2); color:var(--muted); }
  .filter-tipo-btn.sel{ background:var(--grad); border-color:transparent; color:#fff; }
  .filter-tipo-btn:active { opacity:.7; }
  .filter-rango       { display:flex; gap:8px; }
  .filter-rango input { flex:1; background:var(--card2); border:1.5px solid rgba(59,130,246,.12); border-radius:var(--r-xs); padding:8px 10px; font-size:13px; color:var(--text); }
  .filter-rango input:focus { border-color:var(--accent); outline:none; }
  .btn-limpiar        { width:100%; padding:10px; border-radius:var(--r-sm); font-weight:600; font-size:13px; background:rgba(244,63,94,.06); color:var(--danger); border:1px solid rgba(244,63,94,.18); }
  .btn-limpiar:active { opacity:.7; }

  /* ── Metas de ahorro ── */
  .meta-card           { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:20px; margin-bottom:12px; }
  .meta-header         { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px; }
  .meta-nombre         { font-size:17px; font-weight:700; letter-spacing:-.3px; line-height:1.3; }
  .meta-fecha          { font-size:12px; color:var(--muted); margin-top:3px; }
  .icon-btn-sm         { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.07); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
  .icon-btn-sm:active  { opacity:.6; }
  .meta-progress-label { display:flex; align-items:baseline; gap:4px; margin-top:8px; }
  .meta-de-label       { font-size:13px; color:var(--muted); flex:1; }
  .meta-pct            { font-size:13px; font-weight:700; color:var(--accent2); }
  .meta-contribs       { border-top:1px solid var(--border); margin-top:14px; padding-top:12px; display:flex; flex-direction:column; gap:9px; }
  .meta-contrib-fila   { display:flex; align-items:center; gap:8px; font-size:13px; }
  .meta-contrib-fecha  { color:var(--muted); flex-shrink:0; font-size:12px; }
  .meta-contrib-nota   { color:var(--muted); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-style:italic; font-size:12px; }
  .meta-contrib-monto  { font-weight:700; color:var(--success); flex-shrink:0; }
  .meta-contrib-del    { width:22px; height:22px; border-radius:50%; background:rgba(244,63,94,.1); color:var(--danger); font-size:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .meta-contrib-del:active { opacity:.6; }
  .btn-aporte          { width:100%; padding:12px; border-radius:var(--r-sm); font-weight:600; font-size:14px; background:rgba(59,130,246,.08); color:var(--accent2); border:1px solid rgba(59,130,246,.15); margin-top:14px; }
  .btn-aporte:active   { opacity:.7; }
  .btn-aporte:disabled { opacity:.4; cursor:default; }

  /* ── Picker medio ── */
  .medio-picker { display:flex; gap:8px; }
  .medio-opt { flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; padding:12px 4px; border-radius:13px; font-size:12px; font-weight:600; border:1.5px solid var(--border); background:var(--card2); color:var(--muted); transition:all .15s; }
  .medio-opt span:first-child { font-size:20px; }
  .medio-opt:active { opacity:.7; }
`;
