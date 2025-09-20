import { useLocation, useParams } from "react-router-dom";
import GiftAddForm from "./GiftAddForm";

const GiftEditForm = () => {
  const { state } = useLocation();
  const { id } = useParams();

  const gift = state?.gift || null;

  if (!gift) {
    return <div className="p-6">No gift data found for ID: {id}</div>;
  }

  return <GiftAddForm editMode={true} initialData={gift} />;
};

export default GiftEditForm;
