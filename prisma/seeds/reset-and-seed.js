import { execSync } from 'child_process'

try {
  console.log('🌱 Resetando o banco de dados...')
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' })

  console.log('📦 Rodando seed...')
  execSync('npm run seed', { stdio: 'inherit' })

  console.log('✅ Banco resetado e seed aplicado com sucesso!')
} catch (error) {
  console.error('❌ Ocorreu um erro:', error)
  process.exit(1)
}
