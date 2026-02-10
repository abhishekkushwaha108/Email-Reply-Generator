package com.email.writer.service;

import com.email.writer.model.EmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailGeneratorService {

    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    public EmailGeneratorService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    /* ================= MAIN ================= */

    public String generateEmailReply(EmailRequest req) {

        String prompt = buildPrompt(req);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You are the recipient of the email. Reply ONLY as the recipient."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.6
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(apiUrl, entity, Map.class);

        Map<?, ?> choice =
                (Map<?, ?>) ((List<?>) response.getBody().get("choices")).get(0);
        Map<?, ?> message = (Map<?, ?>) choice.get("message");

        // 🔒 CLEAN AI OUTPUT
        String aiReply = cleanAiOutput(message.get("content").toString());




        return aiReply;
    }

    /* ================= PROMPT ================= */

    private String buildPrompt(EmailRequest req) {

        String senderName = safe(req.getSenderName());
        String tone = safe(req.getTone());

        StringBuilder sb = new StringBuilder();

        sb.append("You are replying to this email as the recipient.\n");

        if (!tone.isEmpty()) {
            sb.append("Use a ").append(tone).append(" tone.\n");
        }

        sb.append("Start the reply by addressing the sender: ")
                .append(senderName.isEmpty() ? "Hello" : senderName)
                .append(".\n");


        sb.append("Do not include a subject line.\n");
        sb.append("Do not include analysis, explanations, or headings.\n");
        sb.append("Write only the email reply text.\n");

        sb.append("\nOriginal email:\n");
        sb.append(req.getEmailContent());

        return sb.toString();
    }


    /* ================= HELPERS ================= */


    private String cleanAiOutput(String text) {
        if (text == null) return "";

        text = text.replaceAll("(?i)^analysis[\\s\\S]*?\\n\\n", "");
        text = text.replaceAll("(?i)^analysis of the tone[\\s\\S]*?\\n\\n", "");
        text = text.replaceAll("(?i)^reply:\\s*", "");

        return text.trim();
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
