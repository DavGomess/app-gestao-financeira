export function formatarValor(valor: number, abreviar: boolean = false): string {
    if (isNaN(valor)) return "R$ 0,00";

    if (abreviar) {
        const absValor = Math.abs(valor);
        let abreviado = "";

        if (absValor >= 1_000_000_000) {
            abreviado = (valor / 1_000_000_000).toFixed(1).replace(".", ",") + "bi";
        } else if (absValor >= 1_000_000) {
            abreviado = (valor / 1_000_000).toFixed(1).replace(".", ",") + "mi";
        }else if (absValor >= 1_000) {
            abreviado = (valor / 1_000).toFixed(1).replace(".", ",") + "k";
        } else {
            abreviado = valor.toFixed(0).replace(".", ",");
        }
        return `R$ ${abreviado}`;
    }

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    })
}