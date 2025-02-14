export interface Account {
    id: number;
    clientId: number;
    type: 'მიმდინარე' | 'შემნახველი' | 'დაგროვებითი';
    currency: 'GEL' | 'USD' | 'EUR';
    status: 'აქტიური' | 'დახურული';
    accountNumber: number;
}
