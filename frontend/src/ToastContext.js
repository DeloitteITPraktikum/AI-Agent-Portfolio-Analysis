import { createContext } from "react";

const ToastContext = createContext({
  showToast: () => {}
});

export default ToastContext;
