import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import type { TravelPlanResponse, DayItinerary } from '@/lib/llm/types';
import { cn } from '@/lib/utils';

interface InteractiveItineraryProps {
  plan: TravelPlanResponse;
  selectedDay: number | null;
  onDaySelect: (day: number | null) => void;
  onReorderActivities: (dayIndex: number, activities: string[]) => void;
}

export function InteractiveItinerary({
  plan,
  selectedDay,
  onDaySelect,
  onReorderActivities
}: InteractiveItineraryProps) {
  const handleDragEnd = (result: any, dayIndex: number) => {
    if (!result.destination) return;

    const day = plan.itinerary[dayIndex];
    const items = Array.from(day.activities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorderActivities(dayIndex, items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Itinerary</h2>
        {selectedDay !== null && (
          <button
            onClick={() => onDaySelect(null)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            View All Days
          </button>
        )}
      </div>

      <div className="space-y-4">
        {plan.itinerary.map((day, dayIndex) => (
          <Collapsible.Root
            key={dayIndex}
            defaultOpen={selectedDay === dayIndex}
            className={cn(
              "border rounded-lg overflow-hidden",
              selectedDay === dayIndex && "ring-2 ring-blue-500"
            )}
          >
            <Collapsible.Trigger className="w-full">
              <div
                className={cn(
                  "flex items-center justify-between p-4",
                  "bg-gray-50 hover:bg-gray-100 transition-colors",
                  selectedDay === dayIndex && "bg-blue-50 hover:bg-blue-100"
                )}
                onClick={() => onDaySelect(selectedDay === dayIndex ? null : dayIndex)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Day {day.day}</span>
                  {selectedDay === dayIndex ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>
            </Collapsible.Trigger>

            <Collapsible.Content>
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, dayIndex)}>
                <Droppable droppableId={`day-${dayIndex}`}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="p-4 space-y-2"
                    >
                      {day.activities.map((activity, index) => (
                        <Draggable
                          key={`${dayIndex}-${index}`}
                          draggableId={`${dayIndex}-${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "p-3 rounded-md bg-white border",
                                "transition-shadow duration-200",
                                snapshot.isDragging && "shadow-lg",
                                "hover:shadow-md"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                                <span>{activity}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
      </div>
    </div>
  );
}