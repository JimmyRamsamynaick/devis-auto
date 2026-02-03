import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)
  const jimmyPassword = await bcrypt.hash('Pokemon15082005.', 10)
  
  // Create Admin User
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password,
    },
  })

  // Create Jimmy User
  const jimmy = await prisma.user.upsert({
    where: { email: 'jimmyramsamynaick@gmail.com' },
    update: {
      password: jimmyPassword,
    },
    create: {
      email: 'jimmyramsamynaick@gmail.com',
      name: 'Jimmy Ramsamynaick',
      password: jimmyPassword,
    },
  })
  
  console.log({ user, jimmy })

  // Create Services
  const services = [
    // Maintenance & Dépannage
    { name: 'Diagnostic informatique', category: 'Maintenance', price: 50, duration: 30 },
    { name: 'Maintenance PC / Mac', category: 'Maintenance', price: 80, duration: 60 },
    { name: 'Nettoyage logiciel', category: 'Maintenance', price: 60, duration: 45 },
    { name: 'Suppression de virus / malware', category: 'Maintenance', price: 90, duration: 90 },
    { name: 'Optimisation système', category: 'Maintenance', price: 70, duration: 60 },
    { name: 'Dépannage matériel', category: 'Maintenance', price: 60, duration: 60 }, // Prix min
    { name: 'Dépannage logiciel', category: 'Maintenance', price: 60, duration: 60 },
    { name: 'Assistance à distance', category: 'Maintenance', price: 40, duration: 30 },
    
    // Installation & Configuration
    { name: 'Installation système (Windows / Linux)', category: 'Installation', price: 100, duration: 120 },
    { name: 'Installation logiciels', category: 'Installation', price: 40, duration: 30 },
    { name: 'Configuration poste de travail', category: 'Installation', price: 80, duration: 60 },
    { name: 'Mise en réseau', category: 'Installation', price: 120, duration: 120 },
    { name: 'Configuration imprimante', category: 'Installation', price: 50, duration: 30 },
    { name: 'Sauvegarde & restauration', category: 'Installation', price: 90, duration: 90 },

    // Sécurité
    { name: 'Sécurisation du système', category: 'Sécurité', price: 100, duration: 90 },
    { name: 'Mise en place antivirus', category: 'Sécurité', price: 50, duration: 30 },
    { name: 'Sauvegarde des données', category: 'Sécurité', price: 80, duration: 60 },
    { name: 'Conseils sécurité', category: 'Sécurité', price: 60, duration: 60 },

    // Réseau & Internet
    { name: 'Configuration box / routeur', category: 'Réseau', price: 60, duration: 45 },
    { name: 'Dépannage connexion', category: 'Réseau', price: 70, duration: 60 },
    { name: 'Wi-Fi / Ethernet', category: 'Réseau', price: 80, duration: 60 },

    // Développement & Services avancés
    { name: 'Création site web', category: 'Développement', price: 1000, duration: 0 }, // Sur devis
    { name: 'Maintenance site web', category: 'Développement', price: 100, duration: 60 },
    { name: 'Scripts & automatisation', category: 'Développement', price: 150, duration: 0 },
    { name: 'Assistance technique personnalisée', category: 'Développement', price: 80, duration: 60 },
  ]

  for (const service of services) {
    // Check if service exists
    const existing = await prisma.service.findFirst({
      where: { name: service.name }
    })
    
    if (!existing) {
      await prisma.service.create({
        data: service,
      })
    }
  }

  console.log('Services seeded')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
