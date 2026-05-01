// src/translations/sellers/sellerBulkStock.js

export const sellerBulkStockTranslations = {
  en: {
    // Navigation
    backToInventory: "Back to Inventory",
    
    // Header
    title: "Bulk Stock Update",
    subtitle: "Update stock quantities for multiple products at once",
    
    // Stats
    products: "Products",
    changes: "Changes",
    resetAll: "Reset All",
    
    // Search
    searchPlaceholder: "Search products...",
    searchShort: "Search...",
    
    // Table Headers
    product: "Product",
    current: "Current",
    newStock: "New Stock",
    change: "Change",
    
    // Mobile
    currentLabel: "Current",
    newStockPlaceholder: "New stock",
    
    // Buttons
    updateButton: "Update {count} product{count !== 1 ? 's' : ''}",
    updating: "Updating {count} product(s)...",
    yesUpdate: "Yes, update",
    cancel: "Cancel",
    
    // Messages
    noChanges: "No changes to update",
    resetSuccess: "All changes reset",
    confirmUpdate: "Update stock for {count} product(s)?",
    updateSuccess: "Updated {count} product(s)!",
    updateSuccessMessage: "Successfully updated stock for {count} product(s)!",
    updateError: "Error updating stock",
    failedToLoad: "Failed to load products",
    loadingProducts: "Loading products...",
    noProductsFound: "No products found",
    
    // Reason
    bulkUpdateReason: "Bulk stock update",
    
    // Guidelines
    guidelinesTitle: "Bulk Update Guidelines",
    guidelinesText: "Changes will be logged with \"Bulk stock update\" as the reason. Stock cannot go below 0."
  },
  
  sw: {
    // Navigation
    backToInventory: "Rudi kwenye Orodha ya Bidhaa",
    
    // Header
    title: "Sasisha Kwa Wingi",
    subtitle: "Sasisha idadi ya bidhaa nyingi kwa wakati mmoja",
    
    // Stats
    products: "Bidhaa",
    changes: "Mabadiliko",
    resetAll: "Rudisha Yote",
    
    // Search
    searchPlaceholder: "Tafuta bidhaa...",
    searchShort: "Tafuta...",
    
    // Table Headers
    product: "Bidhaa",
    current: "Sasa",
    newStock: "Idadi Mpya",
    change: "Mabadiliko",
    
    // Mobile
    currentLabel: "Idadi ya sasa",
    newStockPlaceholder: "Idadi mpya",
    
    // Buttons
    updateButton: "Sasisha bidhaa {count}",
    updating: "Inasasisha bidhaa {count}...",
    yesUpdate: "Ndiyo, sasisha",
    cancel: "Ghairi",
    
    // Messages
    noChanges: "Hakuna mabadiliko ya kusasisha",
    resetSuccess: "Mabadiliko yote yamerudishwa",
    confirmUpdate: "Sasisha idadi kwa bidhaa {count}?",
    updateSuccess: "Bidhaa {count} zimesasishwa!",
    updateSuccessMessage: "Idadi kwa bidhaa {count} imesasishwa kikamilifu!",
    updateError: "Hitilafu wakati wa kusasisha idadi",
    failedToLoad: "Imeshindwa kupakia bidhaa",
    loadingProducts: "Inapakia bidhaa...",
    noProductsFound: "Hakuna bidhaa zilizopatikana",
    
    // Reason
    bulkUpdateReason: "Sasisha kwa wingi",
    
    // Guidelines
    guidelinesTitle: "Miongozo ya Kusasisha Kwa Wingi",
    guidelinesText: "Mabadiliko yatahifadhiwa kwa sababu ya \"Sasisha kwa wingi\". Idadi haiwezi kuwa chini ya 0."
  }
};

export default sellerBulkStockTranslations;