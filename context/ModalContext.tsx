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
  open: (name: string) => void;
  close: (name?: string) => void;
  // openName: string;
  openNames: string[];
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export default function Modal({ children }: { children: React.ReactNode }) {
  // const [openName, setOpenName] = useState("");
  const [openNames, setOpenNames] = useState<string[]>([]);

  // const close = () => setOpenName("");
  // const open = setOpenName;

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
    //   if (openName !== "") {
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

interface Open {
  children: React.ReactElement<{ onClick?: () => void }>;
  opens: string;
}

function Open({ children, opens: opensWindowName }: Open) {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      "Modal components must be rendered within a Modal component."
    );
  }
  const { open } = context;

  // return cloneElement(children, { onClick: () => open(opensWindowName) });
  const childElement = children as React.ReactElement<any>;

  return cloneElement(childElement, {
    onClick: (e: React.MouseEvent) => {
      if (childElement.props?.onClick) {
        childElement.props.onClick(e);
      }
      open(opensWindowName);
    },
  });
}

interface Window {
  children?: React.ReactElement<{ onCloseModal?: () => void }>;
  name: string;
  allowOutsideClick?: boolean;
  showBg?: boolean;
}

function Window({ children, name, allowOutsideClick, showBg = true }: Window) {
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

  // if (name !== openName) return null;
  if (!openNames.includes(name)) return null;

  return createPortal(
    //Overlay
    <div className="transition-all ease-in-out fixed h-screen top-0 left-0 w-full z-[1000] bg-black/20 backdrop-blur-sm text">
      {/*Modal */}
      <div
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
          <Button onClick={close}>
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

interface Button {
  children: React.ReactNode;
  onClick: () => void;
}

export function Button({ children, onClick }: Button) {
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
