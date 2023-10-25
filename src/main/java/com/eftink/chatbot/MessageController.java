package com.eftink.chatbot;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

import com.github.javafaker.Faker;

@Controller
public class MessageController {
  Faker faker = new Faker();

  @MessageMapping("/chat")
  @SendTo("/topic/chatroom")
  public Message chat(Message message) throws Exception {
    Thread.sleep(500); // simulated delay
    return new Message(faker.lorem().sentence());
  }

}
