import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Modal } from "./Modal";

interface ContainerViewProps {
  locationId: Id<"locations">;
  containerId: Id<"containers"> | null;
  onBack: () => void;
  onSelectContainer: (id: Id<"containers">) => void;
}

export function ContainerView({ locationId, containerId, onBack, onSelectContainer }: ContainerViewProps) {
  const location = useQuery(api.locations.get, { id: locationId });
  const container = useQuery(api.containers.get, containerId ? { id: containerId } : "skip");
  const path = useQuery(api.containers.getPath, containerId ? { id: containerId } : "skip");

  const containers = useQuery(
    containerId ? api.containers.listByParent : api.containers.listByLocation,
    containerId ? { parentContainerId: containerId } : { locationId }
  );

  const items = useQuery(
    api.items.listByContainer,
    containerId ? { containerId } : "skip"
  );

  const createContainer = useMutation(api.containers.create);
  const deleteContainer = useMutation(api.containers.remove);
  const createItem = useMutation(api.items.create);
  const deleteItem = useMutation(api.items.remove);

  const [showAddContainer, setShowAddContainer] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [containerName, setContainerName] = useState("");
  const [containerDesc, setContainerDesc] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "container" | "item"; id: string } | null>(null);

  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerName.trim()) return;

    setIsSubmitting(true);
    try {
      await createContainer({
        name: containerName.trim(),
        description: containerDesc.trim() || undefined,
        locationId,
        parentContainerId: containerId || undefined,
      });
      setShowAddContainer(false);
      setContainerName("");
      setContainerDesc("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !containerId) return;

    setIsSubmitting(true);
    try {
      await createItem({
        name: itemName.trim(),
        description: itemDesc.trim() || undefined,
        quantity: itemQty ? parseInt(itemQty) : undefined,
        containerId,
      });
      setShowAddItem(false);
      setItemName("");
      setItemDesc("");
      setItemQty("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === "container") {
      await deleteContainer({ id: deleteConfirm.id as Id<"containers"> });
    } else {
      await deleteItem({ id: deleteConfirm.id as Id<"items"> });
    }
    setDeleteConfirm(null);
  };

  if (location === undefined || containers === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Location not found</p>
        <button onClick={onBack} className="btn-secondary mt-4">Go back</button>
      </div>
    );
  }

  const currentName = containerId && container ? container.name : location.name;

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-4 md:mb-6 overflow-x-auto pb-2">
        <button onClick={() => onBack()} className="text-stone-400 hover:text-charcoal transition-colors whitespace-nowrap flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        {!containerId ? (
          <>
            <span className="text-stone-300">/</span>
            <span className="text-charcoal font-medium whitespace-nowrap">{location.name}</span>
          </>
        ) : path ? (
          path.map((item: { id: string; name: string; type: "location" | "container" }, idx: number) => (
            <span key={item.id} className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <span className="text-stone-300">/</span>
              {idx === path.length - 1 ? (
                <span className="text-charcoal font-medium">{item.name}</span>
              ) : (
                <button
                  onClick={() => {
                    if (item.type === "location") {
                      onBack();
                    } else {
                      onSelectContainer(item.id as Id<"containers">);
                    }
                  }}
                  className="text-stone-400 hover:text-charcoal transition-colors"
                >
                  {item.name}
                </button>
              )}
            </span>
          ))
        ) : null}
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-charcoal">{currentName}</h2>
          {(containerId ? container?.description : location.description) && (
            <p className="text-stone-500 mt-1 text-sm md:text-base">
              {containerId ? container?.description : location.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setShowAddContainer(true)}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add container
          </button>
          {containerId && (
            <button
              onClick={() => setShowAddItem(true)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add item
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 md:space-y-8">
        {/* Containers */}
        {containers.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-3 md:mb-4">Containers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 stagger-children">
              {containers.map((c: { _id: Id<"containers">; name: string; description?: string }) => (
                <div
                  key={c._id}
                  className="group bg-white rounded-xl p-4 card-depth cursor-pointer relative"
                  onClick={() => onSelectContainer(c._id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="w-9 h-9 md:w-10 md:h-10 bg-terracotta/10 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-charcoal truncate">{c.name}</h4>
                      {c.description && (
                        <p className="text-stone-500 text-sm mt-0.5 line-clamp-1">{c.description}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ type: "container", id: c._id });
                      }}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all touch:opacity-100"
                    >
                      <svg className="w-4 h-4 text-stone-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-stone-400 text-xs">
                    <span>Open</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Items */}
        {containerId && items !== undefined && items.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-3 md:mb-4">Items</h3>
            <div className="bg-white rounded-xl card-depth overflow-hidden">
              <div className="divide-y divide-stone-100">
                {items.map((item: { _id: Id<"items">; name: string; description?: string; quantity?: number }, idx: number) => (
                  <div
                    key={item._id}
                    className="group p-4 hover:bg-stone-50 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-sage-light/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 6h.008v.008H6V6z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-charcoal truncate">{item.name}</span>
                            {item.quantity && item.quantity > 1 && (
                              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full flex-shrink-0">
                                ×{item.quantity}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-stone-500 text-sm truncate">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteConfirm({ type: "item", id: item._id })}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all touch:opacity-100 flex-shrink-0"
                      >
                        <svg className="w-4 h-4 text-stone-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty state */}
        {containers.length === 0 && (!containerId || (items && items.length === 0)) && (
          <div className="text-center py-12 md:py-16">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg md:text-xl text-charcoal mb-2">
              {containerId ? "This container is empty" : "No containers yet"}
            </h3>
            <p className="text-stone-500 mb-6 max-w-md mx-auto text-sm md:text-base">
              {containerId
                ? "Add containers or items to organize what's inside"
                : "Add a container like a drawer, shelf, or box"
              }
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setShowAddContainer(true)}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add container
              </button>
              {containerId && (
                <button
                  onClick={() => setShowAddItem(true)}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add item
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Container Modal */}
      <Modal isOpen={showAddContainer} onClose={() => setShowAddContainer(false)} title="Add a container">
        <form onSubmit={handleCreateContainer} className="space-y-4">
          <div>
            <label htmlFor="container-name" className="block text-sm font-medium text-stone-600 mb-1.5">
              Name
            </label>
            <input
              id="container-name"
              type="text"
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              className="input-zen"
              placeholder="e.g., Drawer, Shelf, Box"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="container-desc" className="block text-sm font-medium text-stone-600 mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="container-desc"
              value={containerDesc}
              onChange={(e) => setContainerDesc(e.target.value)}
              className="input-zen resize-none"
              rows={2}
              placeholder="Add notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddContainer(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!containerName.trim() || isSubmitting} className="btn-primary flex-1 disabled:opacity-50">
              {isSubmitting ? "Adding..." : "Add container"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItem} onClose={() => setShowAddItem(false)} title="Add an item">
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div>
            <label htmlFor="item-name" className="block text-sm font-medium text-stone-600 mb-1.5">
              Name
            </label>
            <input
              id="item-name"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="input-zen"
              placeholder="e.g., Winter jacket, Spare keys"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="item-qty" className="block text-sm font-medium text-stone-600 mb-1.5">
              Quantity (optional)
            </label>
            <input
              id="item-qty"
              type="number"
              min="1"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
              className="input-zen"
              placeholder="1"
              inputMode="numeric"
            />
          </div>
          <div>
            <label htmlFor="item-desc" className="block text-sm font-medium text-stone-600 mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="item-desc"
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              className="input-zen resize-none"
              rows={2}
              placeholder="Add notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddItem(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!itemName.trim() || isSubmitting} className="btn-primary flex-1 disabled:opacity-50">
              {isSubmitting ? "Adding..." : "Add item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title={`Delete ${deleteConfirm?.type}?`}>
        <p className="text-stone-600 mb-6">
          {deleteConfirm?.type === "container"
            ? "This will permanently delete this container and all items inside it. This action cannot be undone."
            : "This will permanently delete this item. This action cannot be undone."
          }
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
