import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Modal } from "./Modal";

interface LocationsListProps {
  onSelectLocation: (id: Id<"locations">) => void;
}

export function LocationsList({ onSelectLocation }: LocationsListProps) {
  const locations = useQuery(api.locations.list);
  const createLocation = useMutation(api.locations.create);
  const deleteLocation = useMutation(api.locations.remove);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"locations"> | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      await createLocation({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      });
      setShowAddModal(false);
      setNewName("");
      setNewDescription("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"locations">) => {
    await deleteLocation({ id });
    setDeleteConfirm(null);
  };

  if (locations === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-charcoal">Your Spaces</h2>
          <p className="text-stone-500 text-sm md:text-base mt-1">Physical locations where your things live</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add location
        </button>
      </div>

      {/* Locations grid */}
      {locations.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
          <h3 className="font-serif text-xl md:text-2xl text-charcoal mb-2">No locations yet</h3>
          <p className="text-stone-500 mb-6 max-w-md mx-auto text-sm md:text-base">
            Start by adding a location like "Home", "Office", or "Storage Unit"
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add your first location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {locations.map((location: { _id: Id<"locations">; name: string; description?: string }) => (
            <div
              key={location._id}
              className="group bg-white rounded-xl p-4 md:p-5 card-depth cursor-pointer relative"
              onClick={() => onSelectLocation(location._id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-sage-light/30 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg md:text-xl text-charcoal truncate">{location.name}</h3>
                  {location.description && (
                    <p className="text-stone-500 text-sm mt-1 line-clamp-2">{location.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(location._id);
                  }}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all touch:opacity-100"
                >
                  <svg className="w-4 h-4 text-stone-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1 mt-4 text-stone-400 text-sm">
                <span>Open</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add a location">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-1.5">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-zen"
              placeholder="e.g., Home, Office, Garage"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-600 mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="input-zen resize-none"
              rows={2}
              placeholder="Add notes about this location..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!newName.trim() || isSubmitting} className="btn-primary flex-1 disabled:opacity-50">
              {isSubmitting ? "Adding..." : "Add location"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Delete location?">
        <p className="text-stone-600 mb-6">
          This will permanently delete this location and all containers and items inside it. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
