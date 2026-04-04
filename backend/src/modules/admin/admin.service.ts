import prisma from "../../config/database";

/**
 * Update personal admin profile
 * @param adminId The ID of the admin
 * @param data Data to update
 */
export const updateAdminProfileService = async (adminId: string, data: { name?: string; gender?: any }) => {
  return await prisma.admin.update({
    where: { id: adminId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      adminCode: true,
      verified: true,
      status: true,
      gender: true,
      profileImage: true,
      bannerImage: true,
    },
  });
};
