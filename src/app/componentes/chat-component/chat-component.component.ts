import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../../services/chat-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.component.html',
  styleUrls: ['./chat-component.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  mensajes: any[] = []; // Array para mensajes recibidos
  mensaje: string = ''; // Mensaje a enviar
  username: string = ''; // Nick personalizado por el usuario
  color: string = this.getRandomColor(); // Color único para el usuario
  conectado: boolean = false;
  selectedImage: File | null = null; // Para almacenar la imagen seleccionada

  constructor(public chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getMessages().subscribe((mensaje) => {
      console.log('Nuevo mensaje recibido:', mensaje); // Depuración
      this.mensajes.push(mensaje); // Actualiza el array de mensajes
      console.log('Mensajes actuales:', this.mensajes); // Verifica los mensajes actualizados
    });
  }

  ngOnDestroy(): void {
    this.chatService.desconectar(); // Desconectar al destruir el componente
  }

  onEnter() {
    console.log('Enter presionado. Enviando mensaje...');
    this.enviarMensaje();
  }
  

  // Enviar mensaje
 enviarMensaje() {
    const nuevoMensaje: any = {
        autor: this.username || 'Usuario Anónimo',
        username: this.username || 'Usuario Anónimo',
        color: this.color,
        contenido: this.mensaje,
    };
    

    if (this.selectedImage) {
        const formData = new FormData();
        formData.append('file', this.selectedImage);

        this.chatService.uploadImage(formData).subscribe(
            (imageUrl) => {
                nuevoMensaje.imagenUrl = imageUrl;

                // Enviar el mensaje con la URL de la imagen
                this.chatService.sendMessage(nuevoMensaje);
                this.limpiarCampos();
            },
            (error) => {
                console.error('Error al subir la imagen:', error);
            }
        );
    } else {
        // Enviar el mensaje sin imagen
        this.chatService.sendMessage(nuevoMensaje);
        this.limpiarCampos();
    }
}

private limpiarCampos() {
    this.mensaje = '';
    this.selectedImage = null;
}


  // Obtener un color aleatorio para el usuario
  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  conectar() {
    this.chatService.conectar(); // Establecer conexión WebSocket
    this.chatService.getMensajesGuardados().subscribe(
      (mensajes) => {
        this.mensajes = mensajes; // Cargar los mensajes previos desde la base de datos
        console.log('Mensajes cargados desde la base de datos:', this.mensajes);
        this.conectado = true; // Cambiar el estado a conectado
      },
      (error) => {
        console.error('Error al cargar mensajes guardados:', error);
      }
    );
  }

  desconectar() {
    this.chatService.desconectar();
    this.conectado = false; // Cambiar el estado a desconectado
  }

  // Manejar la selección de imagen
  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }
}
