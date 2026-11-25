import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Input, Label, ListBox, Modal, Select, TextArea, TextField } from "@heroui/react";

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
    [{ color: [] }],
    [{ background: [] }],
    [{ font: [] }],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
];

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <TextField value={value} onChange={onChange} aria-label={placeholder} className="w-full max-w-sm">
      <Input placeholder={placeholder} />
    </TextField>
  );
}

export function TextControl({ label, value, onChange, type = "text", placeholder }) {
  return (
    <TextField value={value} onChange={onChange} className="w-full">
      <Label className="text-xs font-medium text-stone-700">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-300/80 bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400/60 focus:border-amber-400/60 transition"
      />
    </TextField>
  );
}

function editorHtml(html) {
  const text = String(html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text ? html : "";
}

export function RichTextControl({ label, value, onChange }) {
  return (
    <div className="rich-text flex w-full flex-col gap-1.5 sm:col-span-2 my-7">
      <span className="text-xs font-medium text-stone-700">{label}</span>
      <ReactQuill theme="snow" value={value ?? ""} onChange={(html) => onChange(editorHtml(html))} modules={modules} formats={formats} />
    </div>
  );
}

export function AreaControl({ label, value, onChange, placeholder }) {
  return (
    <TextField value={value} onChange={onChange} className="w-full sm:col-span-2">
      <Label className="text-xs font-medium text-stone-700">{label}</Label>
      <TextArea
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-stone-300/80 bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400/60 focus:border-amber-400/60 transition"
      />
    </TextField>
  );
}

export function SelectControl({ label, value, onChange, options, placeholder = "Select" }) {
  return (
    <Select
      className="w-full"
      placeholder={placeholder}
      selectedKey={value || null}
      onSelectionChange={(key) => {
        if (key != null) onChange(String(key));
      }}
    >
      <Label className="text-xs font-medium text-stone-700">{label}</Label>
      <Select.Trigger className="glass-panel border-white/60">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="glass-modal">
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.id} id={option.id} textValue={option.label} className="hover:bg-white/60 rounded-lg">
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export function FormDialog({ title, open, onOpenChange, onSubmit, pending, children }) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="glass-modal w-[min(680px,calc(100vw-2rem))] p-4 sm:p-6">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-serif text-2xl text-ink">{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="grid gap-4 sm:grid-cols-2">{children}</div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="ghost" className="rounded-full hover:bg-white/60">
                Cancel
              </Button>
              <Button variant="primary" className="glass-btn-primary rounded-full px-5 py-2 text-xs font-medium cursor-pointer" onPress={onSubmit} isPending={pending}>
                Save
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export function ConfirmDialog({ title, body, open, onOpenChange, onConfirm, pending }) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="glass-modal max-w-md p-4 sm:p-6">
            <Modal.Header>
              <Modal.Heading className="font-serif text-2xl text-ink">{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="ghost" className="rounded-full hover:bg-white/60">
                Keep it
              </Button>
              <Button
                variant="danger"
                className="rounded-full px-4 py-2 text-xs font-medium bg-rose-50/70 border border-rose-200/80 text-rose-800 hover:bg-rose-100/80 backdrop-blur-xs cursor-pointer"
                onPress={onConfirm}
                isPending={pending}
              >
                Remove
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
