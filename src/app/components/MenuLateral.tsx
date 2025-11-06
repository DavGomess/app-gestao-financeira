"use client";
import Image from "next/image";
import { menuItems } from "../data/menuItems";
import { useSelected } from "../../contexts/SelectedContext";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";


export default function MenuLateral( ) {
    const { selected, setSelected } = useSelected();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout } = useAuth();
    const router = useRouter();

    const recolherMenu = () => {
        setIsCollapsed((prev) => !prev);
    }

    const handleLogout = () => {
        logout();
        router.push("/login")
    }

    return (
        <div className={`menuLateral ${isCollapsed ? "collapsed" : ""}`}>
                <div className="logo ">
                    {!isCollapsed && <Image
                        src="/image/logo.png"
                        alt="logo"
                        width={50}
                        height={50}>
                    </Image>}
                    {!isCollapsed &&  <p className="titleApp">meuSaldo</p>}
                    <div className="menuIcon">
                        <i className={`bi ${isCollapsed ? "bi-chevron-right menuIconStrongRight" : "bi-chevron-left menuIconStrongleft"} `} onClick={recolherMenu}></i>
                    </div>
                </div>
            <div className="opcoesMenuLateral">
                <ul className="p-0 m-0">
                    {menuItems.map((item) => (
                        <div key={item.id}>
                            <li
                                className={selected === item.id ? "active" : "noActive"}
                                onClick={() => {
                                    if (item.id === "sair") {
                                        handleLogout();
                                    } else {
                                        setSelected(item.id);
                                    }
                                }}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        if (item.id === "sair") {
                                            handleLogout();
                                        } else {
                                            setSelected(item.id)
                                        }
                                    }
                                }}
                            >
                                <div className="link">
                                    <i className={`bi ${item.icon}`}></i>
                                    {!isCollapsed && <span>{item.label}</span>}
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