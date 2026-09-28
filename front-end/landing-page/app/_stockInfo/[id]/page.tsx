
import StockInfoPage from '@/components/Pages/Stockinfo/StockInfo';



export default async function StockInfo({ params }: { params: { id: string } }) {
    const { id } = await params;

    return (
        <StockInfoPage id={id} />
    )
}