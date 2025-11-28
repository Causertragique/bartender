//
//  ProductRepository.swift
//  Bartender
//
//  Repository pour gérer les produits avec SQLite
//

import Foundation
import Combine

class ProductRepository: ObservableObject {
    static let shared = ProductRepository()
    
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let dbManager = DatabaseManager.shared
    
    private init() {
        loadProducts()
    }
    
    // MARK: - Chargement
    
    func loadProducts() {
        isLoading = true
        errorMessage = nil
        
        do {
            products = try dbManager.getAllProducts()
            isLoading = false
        } catch {
            errorMessage = "Erreur lors du chargement: \(error.localizedDescription)"
            isLoading = false
            print("❌ Erreur: \(error)")
        }
    }
    
    // MARK: - CRUD Operations
    
    func addProduct(_ product: Product) {
        do {
            try dbManager.insertProduct(product)
            loadProducts() // Recharger la liste
        } catch {
            errorMessage = "Erreur lors de l'ajout: \(error.localizedDescription)"
            print("❌ Erreur: \(error)")
        }
    }
    
    func updateProduct(_ product: Product) {
        do {
            try dbManager.updateProduct(product)
            loadProducts() // Recharger la liste
        } catch {
            errorMessage = "Erreur lors de la mise à jour: \(error.localizedDescription)"
            print("❌ Erreur: \(error)")
        }
    }
    
    func deleteProduct(id: String) {
        do {
            try dbManager.deleteProduct(id: id)
            loadProducts() // Recharger la liste
        } catch {
            errorMessage = "Erreur lors de la suppression: \(error.localizedDescription)"
            print("❌ Erreur: \(error)")
        }
    }
    
    // MARK: - Recherche et Filtrage
    
    func searchProducts(query: String) -> [Product] {
        guard !query.isEmpty else { return products }
        
        do {
            return try dbManager.searchProducts(query: query)
        } catch {
            errorMessage = "Erreur lors de la recherche: \(error.localizedDescription)"
            return []
        }
    }
    
    func getProducts(byCategory category: String) -> [Product] {
        do {
            return try dbManager.getProducts(byCategory: category)
        } catch {
            errorMessage = "Erreur lors du filtrage: \(error.localizedDescription)"
            return []
        }
    }
    
    func getLowStockProducts(threshold: Int = 5) -> [Product] {
        do {
            return try dbManager.getLowStockProducts(threshold: threshold)
        } catch {
            errorMessage = "Erreur: \(error.localizedDescription)"
            return []
        }
    }
    
    // MARK: - Gestion du Stock
    
    func addStock(productId: String, amount: Int) {
        guard let product = products.first(where: { $0.id == productId }) else { return }
        
        var updatedProduct = product
        updatedProduct.quantity += amount
        updatedProduct.lastRestocked = Date()
        
        do {
            try dbManager.updateProductQuantity(id: productId, quantity: updatedProduct.quantity)
            loadProducts()
        } catch {
            errorMessage = "Erreur lors de l'ajout de stock: \(error.localizedDescription)"
        }
    }
    
    func removeStock(productId: String, amount: Int) {
        guard let product = products.first(where: { $0.id == productId }) else { return }
        
        var updatedProduct = product
        updatedProduct.quantity = max(0, updatedProduct.quantity - amount)
        
        do {
            try dbManager.updateProductQuantity(id: productId, quantity: updatedProduct.quantity)
            loadProducts()
        } catch {
            errorMessage = "Erreur lors du retrait de stock: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Statistiques
    
    func getTotalInventoryValue() -> Double {
        do {
            return try dbManager.getTotalInventoryValue()
        } catch {
            return 0.0
        }
    }
    
    func getTotalProductsCount() -> Int {
        return products.count
    }
}

