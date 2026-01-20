import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

export const contactRouter = router({
  sendForm: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Имя обязательно"),
        phone: z.string().min(1, "Телефон обязателен"),
        email: z.string().email("Некорректный email"),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Send notification to owner with form data
        const formattedMessage = `
Новая заявка на занятие с сайта "Два-Кадра"

**ФИО:** ${input.name}
**Телефон:** ${input.phone}
**Email:** ${input.email}
${input.message ? `**Сообщение:** ${input.message}` : ""}

---
Отправлено: ${new Date().toLocaleString("ru-RU")}
        `.trim();

        const success = await notifyOwner({
          title: "С сайта 2К - Новая заявка на занятие",
          content: formattedMessage,
        });

        if (!success) {
          throw new Error("Не удалось отправить заявку. Попробуйте позже.");
        }

        return {
          success: true,
          message: "Заявка успешно отправлена",
        };
      } catch (error) {
        console.error("[Contact Form Error]", error);
        throw new Error("Ошибка при отправке заявки. Попробуйте позже.");
      }
    }),
});
