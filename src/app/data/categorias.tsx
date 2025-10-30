export const categorias = {
        Receita: ["Freelance", "Investimentos", "Salário", "Vendas", "Todos"] as const, 
        Despesa: ["Alimentação", "Educação", "Compras", "Entretenimento", "Saúde", "Transporte", "Moradia", "Carro", "Todos"] as const
} as const;

export type TipoCategoria = keyof typeof categorias;

