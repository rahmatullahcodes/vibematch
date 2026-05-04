import { useOutletContext } from "react-router-dom";

export function useAdminOutlet() {
  return useOutletContext();
}
