//
//  DatabaseManager.swift
//  Bartender
//
//  Gestionnaire de base de données SQLite pour l'inventaire
//

import Foundation
import SQLite

// MARK: - Modèle de Données

struct Product: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var category: String
    var subcategory: String?
    var origin: String?
    var price: Double
    var quantity: Int
    var imageUrl: String?
    var inventoryCode: String?
    var qrCode: String?
    var createdAt: Date
    var updatedAt: Date
    var lastRestocked: Date?
    
    init(
        id: String = UUID().uuidString,
        name: String,
        category: String,
        subcategory: String? = nil,
        origin: String? = nil,
        price: Double,
        quantity: Int,
        imageUrl: String? = nil,
        inventoryCode: String? = nil,
        qrCode: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        lastRestocked: Date? = nil
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.subcategory = subcategory
        self.origin = origin
        self.price = price
        self.quantity = quantity
        self.imageUrl = imageUrl
        self.inventoryCode = inventoryCode
        self.qrCode = qrCode
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.lastRestocked = lastRestocked
    }
}

// MARK: - Gestionnaire de Base de Données

class DatabaseManager {
    static let shared = DatabaseManager()
    
    private let db: Connection
    
    // MARK: - Tables
    
    private let products = Table("products")
    private let sales = Table("sales")
    private let settings = Table("settings")
    
    // MARK: - Colonnes Products
    
    private let productId = Expression<String>("id")
    private let productName = Expression<String>("name")
    private let productCategory = Expression<String>("category")
    private let productSubcategory = Expression<String?>("subcategory")
    private let productOrigin = Expression<String?>("origin")
    private let productPrice = Expression<Double>("price")
    private let productQuantity = Expression<Int>("quantity")
    private let productImageUrl = Expression<String?>("imageUrl")
    private let productInventoryCode = Expression<String?>("inventoryCode")
    private let productQrCode = Expression<String?>("qrCode")
    private let productCreatedAt = Expression<Date>("createdAt")
    private let productUpdatedAt = Expression<Date>("updatedAt")
    private let productLastRestocked = Expression<Date?>("lastRestocked")
    
    // MARK: - Colonnes Sales
    
    private let saleId = Expression<String>("id")
    private let saleProductId = Expression<String>("productId")
    private let saleQuantity = Expression<Int>("quantity")
    private let salePrice = Expression<Double>("price")
    private let saleDate = Expression<Date>("date")
    private let salePaymentMethod = Expression<String>("paymentMethod")
    
    // MARK: - Colonnes Settings
    
    private let settingKey = Expression<String>("key")
    private let settingValue = Expression<String>("value")
    
    // MARK: - Initialisation
    
    private init() {
        let path = NSSearchPathForDirectoriesInDomains(
            .documentDirectory, .userDomainMask, true
        ).first!
        
        do {
            db = try Connection("\(path)/bartender.db")
            createTables()
            print("✅ Base de données SQLite initialisée: \(path)/bartender.db")
        } catch {
            fatalError("❌ Erreur lors de l'initialisation de la base de données: \(error)")
        }
    }
    
    // MARK: - Création des Tables
    
    private func createTables() {
        do {
            // Table Products
            try db.run(products.create(ifNotExists: true) { t in
                t.column(productId, primaryKey: true)
                t.column(productName)
                t.column(productCategory)
                t.column(productSubcategory)
                t.column(productOrigin)
                t.column(productPrice)
                t.column(productQuantity)
                t.column(productImageUrl)
                t.column(productInventoryCode)
                t.column(productQrCode)
                t.column(productCreatedAt)
                t.column(productUpdatedAt)
                t.column(productLastRestocked)
                
                // Index pour les recherches rapides
                t.index(productCategory)
                t.index(productName)
                t.index(productInventoryCode)
            })
            
            // Table Sales
            try db.run(sales.create(ifNotExists: true) { t in
                t.column(saleId, primaryKey: true)
                t.column(saleProductId)
                t.column(saleQuantity)
                t.column(salePrice)
                t.column(saleDate)
                t.column(salePaymentMethod)
                
                t.foreignKey(saleProductId, references: products, productId, delete: .setNull)
                t.index(saleDate)
            })
            
            // Table Settings
            try db.run(settings.create(ifNotExists: true) { t in
                t.column(settingKey, primaryKey: true)
                t.column(settingValue)
            })
            
            print("✅ Tables créées avec succès")
        } catch {
            print("❌ Erreur lors de la création des tables: \(error)")
        }
    }
    
    // MARK: - CRUD Products
    
    // CREATE
    func insertProduct(_ product: Product) throws {
        try db.run(products.insert(
            productId <- product.id,
            productName <- product.name,
            productCategory <- product.category,
            productSubcategory <- product.subcategory,
            productOrigin <- product.origin,
            productPrice <- product.price,
            productQuantity <- product.quantity,
            productImageUrl <- product.imageUrl,
            productInventoryCode <- product.inventoryCode,
            productQrCode <- product.qrCode,
            productCreatedAt <- product.createdAt,
            productUpdatedAt <- product.updatedAt,
            productLastRestocked <- product.lastRestocked
        ))
    }
    
    // READ - Tous les produits
    func getAllProducts() throws -> [Product] {
        var productsList: [Product] = []
        for row in try db.prepare(products.order(productName.asc)) {
            productsList.append(rowToProduct(row))
        }
        return productsList
    }
    
    // READ - Produit par ID
    func getProduct(byId id: String) throws -> Product? {
        let query = products.filter(productId == id)
        guard let row = try db.pluck(query) else { return nil }
        return rowToProduct(row)
    }
    
    // READ - Produits par catégorie
    func getProducts(byCategory category: String) throws -> [Product] {
        var productsList: [Product] = []
        let query = products.filter(productCategory == category).order(productName.asc)
        for row in try db.prepare(query) {
            productsList.append(rowToProduct(row))
        }
        return productsList
    }
    
    // READ - Recherche de produits
    func searchProducts(query searchQuery: String) throws -> [Product] {
        let searchPattern = "%\(searchQuery)%"
        let query = products.filter(
            productName.like(searchPattern, escape: "\\") ||
            productInventoryCode.like(searchPattern, escape: "\\")
        ).order(productName.asc)
        
        var productsList: [Product] = []
        for row in try db.prepare(query) {
            productsList.append(rowToProduct(row))
        }
        return productsList
    }
    
    // READ - Produits en stock faible
    func getLowStockProducts(threshold: Int = 5) throws -> [Product] {
        var productsList: [Product] = []
        let query = products.filter(productQuantity <= threshold).order(productQuantity.asc)
        for row in try db.prepare(query) {
            productsList.append(rowToProduct(row))
        }
        return productsList
    }
    
    // UPDATE
    func updateProduct(_ product: Product) throws {
        let productRow = products.filter(productId == product.id)
        try db.run(productRow.update(
            productName <- product.name,
            productCategory <- product.category,
            productSubcategory <- product.subcategory,
            productOrigin <- product.origin,
            productPrice <- product.price,
            productQuantity <- product.quantity,
            productImageUrl <- product.imageUrl,
            productInventoryCode <- product.inventoryCode,
            productQrCode <- product.qrCode,
            productUpdatedAt <- Date(),
            productLastRestocked <- product.lastRestocked
        ))
    }
    
    // UPDATE - Quantité seulement (pour ajout/retrait de stock)
    func updateProductQuantity(id: String, quantity: Int) throws {
        let productRow = products.filter(productId == id)
        try db.run(productRow.update(
            productQuantity <- quantity,
            productUpdatedAt <- Date()
        ))
    }
    
    // DELETE
    func deleteProduct(id: String) throws {
        let productRow = products.filter(productId == id)
        try db.run(productRow.delete())
    }
    
    // MARK: - Statistiques
    
    func getTotalInventoryValue() throws -> Double {
        let total = try db.scalar(
            products.select(productPrice * Expression<Double>(productQuantity)).sum
        )
        return total ?? 0.0
    }
    
    func getTotalProductsCount() throws -> Int {
        return try db.scalar(products.count) ?? 0
    }
    
    func getTotalProductsValue(byCategory category: String) throws -> Double {
        let categoryProducts = products.filter(productCategory == category)
        let total = try db.scalar(
            categoryProducts.select(productPrice * Expression<Double>(productQuantity)).sum
        )
        return total ?? 0.0
    }
    
    // MARK: - Helper Functions
    
    private func rowToProduct(_ row: Row) -> Product {
        return Product(
            id: row[productId],
            name: row[productName],
            category: row[productCategory],
            subcategory: row[productSubcategory],
            origin: row[productOrigin],
            price: row[productPrice],
            quantity: row[productQuantity],
            imageUrl: row[productImageUrl],
            inventoryCode: row[productInventoryCode],
            qrCode: row[productQrCode],
            createdAt: row[productCreatedAt],
            updatedAt: row[productUpdatedAt],
            lastRestocked: row[productLastRestocked]
        )
    }
    
    // MARK: - Settings
    
    func setSetting(key: String, value: String) throws {
        let settingRow = settings.filter(settingKey == key)
        let count = try db.scalar(settingRow.count) ?? 0
        
        if count > 0 {
            try db.run(settingRow.update(settingValue <- value))
        } else {
            try db.run(settings.insert(settingKey <- key, settingValue <- value))
        }
    }
    
    func getSetting(key: String) throws -> String? {
        let query = settings.filter(settingKey == key)
        guard let row = try db.pluck(query) else { return nil }
        return row[settingValue]
    }
    
    // MARK: - Transactions
    
    func transaction(_ block: () throws -> Void) throws {
        try db.transaction(block)
    }
    
    // MARK: - Backup & Restore
    
    func exportDatabase() -> Data? {
        let path = NSSearchPathForDirectoriesInDomains(
            .documentDirectory, .userDomainMask, true
        ).first!
        let dbPath = "\(path)/bartender.db"
        
        return try? Data(contentsOf: URL(fileURLWithPath: dbPath))
    }
    
    func importDatabase(from data: Data) throws {
        let path = NSSearchPathForDirectoriesInDomains(
            .documentDirectory, .userDomainMask, true
        ).first!
        let dbPath = "\(path)/bartender_backup.db"
        
        try data.write(to: URL(fileURLWithPath: dbPath))
        // Optionnel: remplacer la base actuelle
    }
}

