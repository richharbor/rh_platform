import { ScrollArea } from "@/components/ui/scroll-area"
import AddStockForm from "./AddShareForm"

interface AddSharePageProps {
  id?: string;
  bestDeal?: boolean;
  update?:boolean;
}

export default function AddSharePage({id, bestDeal, update} : AddSharePageProps) {
 


  return (
    <div className=" flex h-[calc(100vh-4.5rem)] overflow-hidden rounded-lg border-2 max-md:border-none flex-1 flex-col w-full">
      <div className="flex items-center justify-between border-b h-[60px] p-4">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-bold">
            {update && 'Update Details'}
            {(!update && bestDeal) && 'Add Best Deals'}
            {(!update && !bestDeal) && 'Add Shares'}
          </h2>
        </div>
      </div>
      <ScrollArea className="flex-1 max-h-[calc(100vh-8.5rem)]"> 
        <AddStockForm id = {id} bestDeal = {bestDeal} update={update} />
      </ScrollArea>
    </div>
  )
}

