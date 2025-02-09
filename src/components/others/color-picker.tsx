import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { colorPresets } from "@/lib/colors";
import { motion } from "framer-motion";

interface ColorPickerProps {
  value: { background: string; foreground: string };
  onChange: (color: { background: string; foreground: string }) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-4 h-4 p-0 rounded-full aspect-square"
          style={{
            backgroundColor: value.background,
            borderColor: value.background,
            minWidth: "1rem",
            minHeight: "1rem",
          }}
        >
          <span className="sr-only">カラーを選択</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>カラーを選択</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 py-4">
          {colorPresets.map((color) => (
            <motion.button
              key={color.name}
              className="w-12 h-12 rounded-full transition-colors relative group aspect-square"
              style={{
                backgroundColor: color.background,
                borderColor:
                  value.background === color.background
                    ? "white"
                    : color.background,
                outline:
                  value.background === color.background
                    ? "2px solid black"
                    : "none",
              }}
              onClick={() => onChange(color)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">{color.name}</span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] text-white bg-black/50 rounded-full transition-opacity">
                {color.name}
              </span>
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-4 border-t">
          <div className="text-sm font-medium">カスタムカラー:</div>
          <input
            type="color"
            value={value.background}
            onChange={(e) =>
              onChange({
                background: e.target.value,
                foreground: value.foreground,
              })
            }
            className="w-8 h-8 rounded-full cursor-pointer"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
