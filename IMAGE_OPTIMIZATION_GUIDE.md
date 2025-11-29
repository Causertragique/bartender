# Guide d'optimisation des images

## Problème identifié

Lighthouse a détecté que `tonneau.png` fait **1,910.5 KiB** alors qu'il est affiché à seulement **110x110px**. Cela impacte significativement les performances.

## Solutions recommandées

### 1. Optimiser tonneau.png

**Options :**

#### Option A : Utiliser un outil en ligne
- [Squoosh](https://squoosh.app/) - Outil Google pour optimiser les images
- [TinyPNG](https://tinypng.com/) - Compression PNG/WebP
- [ImageOptim](https://imageoptim.com/) - Pour macOS

**Étapes :**
1. Ouvrir `public/tonneau.png` dans l'outil
2. Réduire la taille à **220x220px** (2x pour les écrans Retina)
3. Convertir en **WebP** avec qualité 80-85%
4. Sauvegarder comme `tonneau.webp`
5. Mettre à jour le code pour utiliser WebP avec fallback PNG

#### Option B : Utiliser ImageMagick (ligne de commande)
```bash
# Convertir en WebP avec compression
magick public/tonneau.png -resize 220x220 -quality 85 public/tonneau.webp

# Ou réduire le PNG existant
magick public/tonneau.png -resize 220x220 -strip -quality 90 public/tonneau-optimized.png
```

### 2. Optimiser Logoaccueil.png

Même processus pour `public/Logoaccueil.png` qui est utilisé sur la page d'accueil (LCP).

### 3. Mise à jour du code

Après optimisation, mettre à jour `client/components/Layout.tsx` :

```typescript
<picture>
  <source srcSet="/tonneau.webp" type="image/webp" />
  <img
    src="/tonneau.png"
    alt={t.layout.appName}
    className="h-20 w-auto object-contain"
    width="110"
    height="110"
    loading="lazy"
    decoding="async"
  />
</picture>
```

Et `client/pages/Home.tsx` :

```typescript
<picture>
  <source srcSet="/Logoaccueil.webp" type="image/webp" />
  <img
    src="/Logoaccueil.png"
    alt="La Réserve"
    className="h-40 w-auto max-w-full object-contain"
    width="160"
    height="160"
    loading="eager"
    fetchPriority="high"
  />
</picture>
```

## Résultats attendus

- Réduction de **~95%** de la taille du fichier (de 1.9 MB à ~100 KB)
- Amélioration du **LCP** (Largest Contentful Paint)
- Réduction du temps de téléchargement
- Meilleure expérience utilisateur, surtout sur mobile

## Note

Les attributs `loading="lazy"` et `decoding="async"` ont déjà été ajoutés pour améliorer les performances. L'optimisation de la taille du fichier est l'étape suivante critique.

