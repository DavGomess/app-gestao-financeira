"use client";

import { useSelected } from "../../contexts/SelectedContext";
import { menuItems } from "../data/menuItems";


export default function Header() {
    const { selected } = useSelected();

    const selectedItem = menuItems.find(
        item => item.id === selected && item.id !== "modoEscuro" && item.id !== "sair"
    );
    return (
        <>
            {selectedItem && (
                <div className="header">
                    <i className={`bi ${selectedItem.icon}`}></i>
                    <div className="headerInfo">
                        <h1>{selectedItem.title}</h1>
                        <p>{selectedItem.description}</p>
                    </div>
                </div>
            )}
        </>
    )
}