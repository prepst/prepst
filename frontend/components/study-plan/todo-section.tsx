"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TodoSection as TodoSectionType } from "./types";
import { TodoItem } from "./todo-item";

interface TodoSectionProps {
  section: TodoSectionType;
  onToggleTodo: (todoId: string) => void;
  isDraggedOver: boolean;
}

export function TodoSection({
  section,
  onToggleTodo,
  isDraggedOver,
}: TodoSectionProps) {
  const { setNodeRef } = useDroppable({
    id: section.id,
  });

  const isMockSection = section.id.startsWith("mock");
  
  return (
    <div
      ref={setNodeRef}
      className={`rounded-3xl border transition-all duration-300 group
        ${isMockSection 
          ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30" 
          : "bg-card border-border shadow-sm hover:shadow-md"
        } 
        ${isDraggedOver ? "ring-2 ring-primary ring-offset-2 bg-accent/50" : ""}
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-border/40 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-105
          ${isMockSection ? "bg-blue-500/10 text-blue-600" : "bg-primary/10 text-primary"}
        `}>
          {section.icon}
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {section.title}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            {section.todos.length} {section.todos.length === 1 ? "session" : "sessions"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <SortableContext
          items={section.todos.map((todo) => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => onToggleTodo(todo.id)}
            />
          ))}
        </SortableContext>
        
        {section.todos.length === 0 && (
          <div className="bg-muted/20 rounded-2xl border-2 border-dashed border-border/50 py-8 px-4 text-center">
            {section.id.startsWith("mock") ? (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-2xl mx-auto shadow-sm">
                  🎯
                </div>
                <div>
                   <div className="font-bold text-foreground">Mock Test Coming Soon</div>
                   <div className="text-xs text-muted-foreground mt-1">Complete practice sessions to unlock</div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm font-medium">
                No sessions in this section
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
