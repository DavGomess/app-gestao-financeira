export type StatusConta = "paga" | "pendente" | "vencida";

export function definirStatus(data: string | Date): StatusConta {
    const hoje = new Date();
    const vencimento = typeof data === "string" ? new Date(data) : data;

    if (vencimento < hoje) {
        return "vencida";
    }

    return "pendente";
}
