import math

from tensorflow import keras
from tensorflow.keras.utils import register_keras_serializable


@register_keras_serializable()
class WarmUpCosine(keras.optimizers.schedules.LearningRateSchedule):
    def __init__(self, initial_lr, warmup_steps, total_steps, name=None):
        super().__init__()
        self.initial_lr = initial_lr
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps
        self.name = name

    def __call__(self, step):
        with keras.backend.name_scope(self.name or "WarmUpCosine"):
            step = keras.backend.cast(step, dtype="float32")
            warmup_steps = keras.backend.cast(self.warmup_steps, dtype="float32")
            total_steps = keras.backend.cast(self.total_steps, dtype="float32")
            initial_lr = keras.backend.cast(self.initial_lr, dtype="float32")
            # Warmup phase
            lr = keras.backend.switch(
                step < warmup_steps,
                initial_lr * (step / warmup_steps),
                # Cosine decay phase
                initial_lr * 0.5 * (1 + keras.backend.cos(math.pi * (step - warmup_steps) / (total_steps - warmup_steps)))
            )
            return lr

    def get_config(self):
        return {
            "initial_lr": self.initial_lr,
            "warmup_steps": self.warmup_steps,
            "total_steps": self.total_steps,
            "name": self.name,
        }
