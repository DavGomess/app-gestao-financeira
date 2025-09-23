"use client"

import Header from "./components/Header";
import MenuLateral from "./components/MenuLateral";
import Dashboard from "./dashboard/dashboard";
import Transacoes from "./transacoes/transacoes";
import Relatorios from "./relatorios/relatorios";
import Metas from "./metas/metas";
import Categorias from "./categorias/categorias";
import Orcamento from "./orcamento/orcamentos";
import ContasPagar from "./contasPagar/contasPagar";
import Configuracoes from "./configuracoes/configuracoes";
import { useSelected } from "@/contexts/SelectedContext";

export default function Home() {

  const { selected } = useSelected();

  return (
    <div className="main">
          <MenuLateral />
        <div className="container p-0">
          <Header/>       
          {selected === "dashboard" && <Dashboard />}
          {selected === "transacoes" && <Transacoes />}
          {selected === "relatorios" && <Relatorios />}
          {selected === "metas" && <Metas />}
          {selected === "categorias" && <Categorias />}
          {selected === "orcamento" && <Orcamento />}
          {selected === "contasPagar" && <ContasPagar />}
          {selected === "configuracoes" && <Configuracoes />}
        </div>
    </div>
  );
}

