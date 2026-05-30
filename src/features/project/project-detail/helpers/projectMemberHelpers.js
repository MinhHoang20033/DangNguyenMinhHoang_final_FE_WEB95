export function buildMemberEmployees(members, employees, user) {
  return (members ?? [])
    .map((member) => {
      const employee = employees.find((item) => item._id === member.employeeId);

      if (!employee) {
        return {
          _id: member.employeeId,
          name:
            member.employeeId === user?.employeeId
              ? user?.username || "Nhân viên"
              : "Thành viên dự án",
          role: "",
          avatar: "",
          assignment: member.assignment,
        };
      }

      return {
        ...employee,
        assignment: member.assignment,
      };
    })
    .filter(Boolean);
}
