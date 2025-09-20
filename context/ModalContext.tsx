"use client";
import { createPortal } from "react-dom";
import React, {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { Icon } from "@iconify/react";
import { ICON } from "../utils/icon-export";

interface ModalContextType {
  open: (name: string, customData?: any) => void;
  close: (name?: string) => void;
  // openName: string;
  openNames: string[];
  customData?: any;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

/**
 * Modal component that provides context for managing modal windows
 */
const Modal = ({ children }: { children: React.ReactNode }) => {
  const [openNames, setOpenNames] = useState<string[]>([]);

  const close = (name?: string) => {
    if (!name) {
      setOpenNames([]);
    } else {
      setOpenNames((prev) => prev.filter((n) => n !== name));
    }
  };

  const open = (name: string) => {
    setOpenNames((prev) => [...prev, name]);
  };

  useEffect(() => {
    if (openNames.length > 0) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [openNames]);

  return (
    <ModalContext.Provider value={{ open, close, openNames }}>
      {children}
    </ModalContext.Provider>
  );
}

interface OpenProps {
  children: React.ReactElement<{ onClick?: () => void }>;
  opens: string;
}

/**
 * A component that wraps a trigger element to open a modal window
 */
function Open({ children, opens: opensWindowName }: OpenProps) {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      "Modal components must be rendered within a Modal component."
    );
  }
  const { open } = context;

  const childElement = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;

  return cloneElement(childElement, {
    onClick: (e: React.MouseEvent) => {
      if (childElement.props?.onClick) {
        childElement.props.onClick(e);
      }
      open(opensWindowName);
    },
  });
}

interface WindowProps {
  children?: React.ReactElement<{ onCloseModal?: () => void }>;
  name: string;
  allowOutsideClick?: boolean;
  showBg?: boolean;
}

/**
 * The modal window component that displays the modal content
 */
function Window({ children, name, allowOutsideClick, showBg = true }: WindowProps) {
  const [isVisible, setIsVisible] = useState(false);

  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      "Modal components must be rendered within a Modal component."
    );
  }

  const { openNames, close } = context;
  const ref = useOutsideClick<HTMLDivElement>(close);

  useEffect(() => {
    if (openNames.includes(name)) {
      setTimeout(() => setIsVisible(true), 0);
    } else {
      setIsVisible(false);
    }
  }, [name, openNames]);

  if (!openNames.includes(name)) return null;

  return createPortal(
    //Overlay
    <div 
      role="dialog"
      aria-modal="true"
      className="transition-all ease-in-out fixed h-screen top-0 left-0 w-full z-[1000] bg-black/20 backdrop-blur-sm text"
    >
      {/*Modal */}
      <div
        role="document"
        className={`transition-all duration-300 ease-in-out transform 
          fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2  rounded-t-2xl  ${
            showBg && "bg-white shadow-menu"
          } 
          ${
            isVisible
              ? "opacity-100 scale-100 visible"
              : "opacity-0 scale-90 invisible"
          }`}
        style={{
          visibility: isVisible ? "visible" : "hidden",
        }}
        ref={allowOutsideClick ? ref : null}
      >
        {/*close button */}
        {showBg && (
          <Button onClick={close} aria-label="Close modal">
            <Icon icon={ICON.CANCEL} fontSize={24} />
          </Button>
        )}

        <div className="p-3">
          {children &&
            cloneElement(children, { onCloseModal: () => close(name) })}
        </div>
      </div>
    </div>,
    document.body
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  'aria-label': string;
}

export function Button({ children, onClick, 'aria-label': ariaLabel }: ButtonProps) {
  return (
    <button
      className="absolute top-[1rem] right-[1rem] transition-all duration-200 rounded-full hover:shadow p-1 cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
