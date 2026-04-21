import bcrypt from 'bcryptjs';
import { prisma } from './prisma-client';

async function main() {
	// Check if admin user exists
	const adminExists = await prisma.user.findFirst({
		where: {
			email: 'admin@mails.com'
		}
	});

	// If admin doesn't exist, create one
	if (!adminExists) {
		const hashedPassword = await bcrypt.hash('helloadmin1', 10);

		const admin = await prisma.user.create({
			data: {
				email: 'admin@mails.com',
				name: 'Admin User',
				password: hashedPassword
			}
		});

		console.log('Admin user created:');
	} else {
		console.log('Admin user already exists');
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
