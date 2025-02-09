import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CommonCard } from "./common";
import { addHideKeyword, removeHideKeyword } from "@/lib/firebase/user";
import { useAuth } from "@/hooks/useAuth";

export const Keywords = () => {
  const { userData } = useAuth();
  const [isKeywordOpen, setIsKeywordOpen] = useState(true);
  const [newKeyword, setNewKeyword] = useState("");

  const handleAddKeywords = async () => {
    if (newKeyword.trim() && userData?.uid) {
      try {
        await addHideKeyword(userData.uid, newKeyword.trim());
        setNewKeyword("");
      } catch (error) {
        console.error("Error adding keyword:", error);
      }
    }
  };

  const handleRemoveKeyword = async (keyword: string) => {
    if (userData?.uid) {
      await removeHideKeyword(userData.uid, keyword);
    }
  };

  return (
    <CommonCard
      title="非表示キーワード"
      icon={<EyeOff className="h-4 w-4" />}
      toggle={() => setIsKeywordOpen(!isKeywordOpen)}
      isOpen={isKeywordOpen}
    >
      <AnimatePresence>
        {isKeywordOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap gap-2">
              {userData?.hideKeywords &&
                userData?.hideKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveKeyword(keyword);
                      }}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="キーワードを入力"
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddKeywords();
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CommonCard>
  );
};
