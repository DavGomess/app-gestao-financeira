"use client";
import Image from "next/image";
import { menuItems } from "../data/menuItems";
import { useSelected } from "@/contexts/SelectedContext";


export default function MenuLateral() {

    const { selected, setSelected } = useSelected();

    return (
        <div className="menuLateral">
                <div className="logo ">
                    <Image
                        src="/image/logo.png"
                        alt="logo"
                        width={50}
                        height={50}>
                    </Image>
                    <p className="p-0 m-0">meuSaldo</p>
                    <div className="menuIcon">
                        <i className="bi bi-chevron-left menuIcon-strong"></i>
                    </div>
                </div>
            {/* <hr /> */}
            <div className="opcoesMenuLateral">
                <ul className="p-0 m-0">

                    {menuItems.map((item) => (
                        <div key={item.id}>
                            <li
                                className={selected === item.id ? "active" : "noActive"}
                                onClick={() => setSelected(item.id)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        setSelected(item.id)
                                    }
                                }}
                            >
                                <div className="link">
                                    <i className={`bi ${item.icon}`}></i>
                                    <span>{item.label}</span>
                                </div>
                            </li>
                            {item.id === "contasPagar" && <hr />}
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    )
}