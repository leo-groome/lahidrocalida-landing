<script>
  // Vue Island — Navbar mobile menu
  import { ref } from 'vue';

  export default {
    name: 'NavbarMobile',
    setup() {
      const isOpen = ref(false);

      const toggle = () => {
        isOpen.value = !isOpen.value;
        document.body.style.overflow = isOpen.value ? 'hidden' : '';
      };

      const close = () => {
        isOpen.value = false;
        document.body.style.overflow = '';
      };

      return { isOpen, toggle, close };
    },
  };
</script>

<template>
  <div class="navbar-mobile">
    <!-- Hamburger (opener) -->
    <button
      class="hamburger"
      :class="{ 'is-open': isOpen }"
      @click="toggle"
      :aria-expanded="isOpen"
      aria-label="Abrir menú"
      id="navbar-hamburger"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="isOpen"
        class="mobile-overlay"
        @click="close"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="drawer">
      <nav
        v-if="isOpen"
        class="mobile-drawer"
        role="navigation"
        aria-label="Menú principal"
      >
        <button class="drawer-close" @click="close" aria-label="Cerrar menú">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <ul>
          <li><a href="#menu" @click="close">Menú</a></li>
          <li><a href="#nosotros" @click="close">Nosotros</a></li>
          <li><a href="#contacto" @click="close">Contacto</a></li>
          <li>
            <a
              href="https://wa.me/524493896785"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--whatsapp"
              @click="close"
            >
              Ordenar por WhatsApp
            </a>
          </li>
        </ul>
      </nav>
    </Transition>
  </div>
</template>

<style scoped>
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 4px;
  border-radius: 8px;
  transition: background 200ms;
}

.hamburger:hover {
  background: rgba(26, 18, 8, 0.06);
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-ink);
  border-radius: 2px;
  transform-origin: center;
  transition: transform 280ms var(--ease-out), opacity 200ms;
}

.hamburger.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger.is-open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.hamburger.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 18, 8, 0.55);
  backdrop-filter: blur(2px);
  z-index: 98;
}

/* Drawer */
.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(320px, 85vw);
  /* Solid, opaque panel so the hero never shows through. */
  background: #ffffff;
  box-shadow: -10px 0 30px rgba(26, 18, 8, 0.18);
  z-index: 99;
  padding: 5rem var(--space-xl) var(--space-xl);
  display: flex;
  flex-direction: column;
}

.drawer-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink);
  border-radius: 8px;
  transition: background 200ms;
}

.drawer-close:hover {
  background: rgba(26, 18, 8, 0.06);
}

.mobile-drawer ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.mobile-drawer a {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-ink);
  transition: color var(--transition);
}

.mobile-drawer a:hover {
  color: var(--color-pozole);
}

.mobile-drawer .btn {
  margin-top: var(--space-md);
  width: 100%;
  justify-content: center;
}

/* Transitions */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 280ms var(--ease-out);
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 340ms var(--ease-out);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
