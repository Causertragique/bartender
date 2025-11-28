//
//  InventoryView.swift
//  Bartender
//
//  Vue principale de l'inventaire utilisant SQLite
//

import SwiftUI

struct InventoryView: View {
    @StateObject private var productRepo = ProductRepository.shared
    @State private var searchText = ""
    @State private var selectedCategory: String? = nil
    @State private var showAddProduct = false
    @State private var editingProduct: Product? = nil
    
    var filteredProducts: [Product] {
        var products = productRepo.products
        
        // Filtre par recherche
        if !searchText.isEmpty {
            products = productRepo.searchProducts(query: searchText)
        }
        
        // Filtre par catégorie
        if let category = selectedCategory {
            products = products.filter { $0.category == category }
        }
        
        return products
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Statistiques
                StatsView(productRepo: productRepo)
                
                // Liste des produits
                if productRepo.isLoading {
                    ProgressView("Chargement...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filteredProducts.isEmpty {
                    EmptyStateView()
                } else {
                    List {
                        ForEach(filteredProducts) { product in
                            ProductRowView(
                                product: product,
                                onEdit: { editingProduct = $0 },
                                onDelete: { productRepo.deleteProduct(id: $0) },
                                onAddStock: { productRepo.addStock(productId: $0, amount: $1) },
                                onRemoveStock: { productRepo.removeStock(productId: $0, amount: $1) }
                            )
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Inventaire")
            .searchable(text: $searchText, prompt: "Rechercher un produit...")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showAddProduct = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Menu {
                        Button("Tous") { selectedCategory = nil }
                        Button("Spiritueux") { selectedCategory = "spirits" }
                        Button("Vin") { selectedCategory = "wine" }
                        Button("Bière") { selectedCategory = "beer" }
                        Button("Snacks") { selectedCategory = "snacks" }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .sheet(isPresented: $showAddProduct) {
                AddProductView(productRepo: productRepo)
            }
            .sheet(item: $editingProduct) { product in
                EditProductView(product: product, productRepo: productRepo)
            }
        }
        .onAppear {
            productRepo.loadProducts()
        }
    }
}

// MARK: - Stats View

struct StatsView: View {
    @ObservedObject var productRepo: ProductRepository
    
    var body: some View {
        HStack(spacing: 20) {
            StatCard(
                title: "Valeur totale",
                value: String(format: "%.2f $", productRepo.getTotalInventoryValue())
            )
            
            StatCard(
                title: "Produits",
                value: "\(productRepo.getTotalProductsCount())"
            )
            
            StatCard(
                title: "Stock faible",
                value: "\(productRepo.getLowStockProducts().count)"
            )
        }
        .padding()
        .background(Color(.systemGray6))
    }
}

struct StatCard: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.headline)
                .fontWeight(.bold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(8)
    }
}

// MARK: - Product Row View

struct ProductRowView: View {
    let product: Product
    let onEdit: (Product) -> Void
    let onDelete: (String) -> Void
    let onAddStock: (String, Int) -> Void
    let onRemoveStock: (String, Int) -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // Image du produit
            if let imageUrl = product.imageUrl, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                }
                .frame(width: 60, height: 60)
                .cornerRadius(8)
            } else {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 60, height: 60)
                    .cornerRadius(8)
            }
            
            // Informations du produit
            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.headline)
                
                Text(product.category.capitalized)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                HStack {
                    Text("\(product.quantity) unités")
                    Text("•")
                    Text(String(format: "%.2f $", product.price))
                }
                .font(.caption)
                .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Actions
            HStack(spacing: 8) {
                Button {
                    onRemoveStock(product.id, 1)
                } label: {
                    Image(systemName: "minus.circle")
                        .foregroundColor(.red)
                }
                
                Button {
                    onAddStock(product.id, 1)
                } label: {
                    Image(systemName: "plus.circle")
                        .foregroundColor(.green)
                }
                
                Button {
                    onEdit(product)
                } label: {
                    Image(systemName: "pencil")
                        .foregroundColor(.blue)
                }
                
                Button {
                    onDelete(product.id)
                } label: {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                }
            }
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Empty State

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("Aucun produit")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Ajoutez votre premier produit pour commencer")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

// MARK: - Add Product View (Exemple simplifié)

struct AddProductView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var productRepo: ProductRepository
    
    @State private var name = ""
    @State private var category = "spirits"
    @State private var price = ""
    @State private var quantity = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section("Informations du produit") {
                    TextField("Nom", text: $name)
                    Picker("Catégorie", selection: $category) {
                        Text("Spiritueux").tag("spirits")
                        Text("Vin").tag("wine")
                        Text("Bière").tag("beer")
                        Text("Snacks").tag("snacks")
                    }
                    TextField("Prix", text: $price)
                        .keyboardType(.decimalPad)
                    TextField("Quantité", text: $quantity)
                        .keyboardType(.numberPad)
                }
            }
            .navigationTitle("Nouveau produit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Ajouter") {
                        if let priceValue = Double(price),
                           let quantityValue = Int(quantity) {
                            let newProduct = Product(
                                name: name,
                                category: category,
                                price: priceValue,
                                quantity: quantityValue
                            )
                            productRepo.addProduct(newProduct)
                            dismiss()
                        }
                    }
                    .disabled(name.isEmpty || price.isEmpty || quantity.isEmpty)
                }
            }
        }
    }
}

// MARK: - Edit Product View (Exemple simplifié)

struct EditProductView: View {
    @Environment(\.dismiss) var dismiss
    let product: Product
    @ObservedObject var productRepo: ProductRepository
    
    @State private var name: String
    @State private var category: String
    @State private var price: String
    @State private var quantity: String
    
    init(product: Product, productRepo: ProductRepository) {
        self.product = product
        self.productRepo = productRepo
        _name = State(initialValue: product.name)
        _category = State(initialValue: product.category)
        _price = State(initialValue: String(product.price))
        _quantity = State(initialValue: String(product.quantity))
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("Informations du produit") {
                    TextField("Nom", text: $name)
                    Picker("Catégorie", selection: $category) {
                        Text("Spiritueux").tag("spirits")
                        Text("Vin").tag("wine")
                        Text("Bière").tag("beer")
                        Text("Snacks").tag("snacks")
                    }
                    TextField("Prix", text: $price)
                        .keyboardType(.decimalPad)
                    TextField("Quantité", text: $quantity)
                        .keyboardType(.numberPad)
                }
            }
            .navigationTitle("Modifier")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sauvegarder") {
                        if let priceValue = Double(price),
                           let quantityValue = Int(quantity) {
                            var updatedProduct = product
                            updatedProduct.name = name
                            updatedProduct.category = category
                            updatedProduct.price = priceValue
                            updatedProduct.quantity = quantityValue
                            productRepo.updateProduct(updatedProduct)
                            dismiss()
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Preview

struct InventoryView_Previews: PreviewProvider {
    static var previews: some View {
        InventoryView()
    }
}

